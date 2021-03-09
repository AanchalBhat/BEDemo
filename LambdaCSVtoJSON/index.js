const mongodbClient = require("mongodb").MongoClient;
const fs = require("fs");
const aws = require("aws-sdk");
const csvtojson = require("csvtojson");
const s3 = new aws.S3({ apiVersion: "2006-03-01" });
let cachedDb = null;
const caBundle = fs.readFileSync("./rds-combined-ca-bundle.pem", "utf8");
const uri =
  //"mongodb://mongodb:LScDW7awJ4aTG3Dg@mr-project-documentdb20200422205359003700000001.cluster-cplegn7qzwwb.us-east-1.docdb.amazonaws.com:27017";
  "mongodb://127.0.0.1/sample"
const options = {
  // ssl: true,
  // sslCA: caBundle,
  // socketTimeoutMS: 2000000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
function connectToDatabase() {
  console.log("Connecting...");

  if (cachedDb && cachedDb.serverConfig.isConnected()) {
    console.log("=> using cached database instance");
    return Promise.resolve(cachedDb);
  }
  return mongodbClient.connect(uri, options).then((client) => {
    cachedDb = client.db("mongo");
    console.log("Connection Established !!");
    return cachedDb;
  });
}

exports.handler = async (event, context) => {
  // console.log('Received event:', JSON.stringify(event, null, 2));

  const db = await connectToDatabase();

  // Get the object from the event and show its content type
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );
  const params = {
    Bucket: bucket,
    Key: key,
  };
  try {
    var file = s3.getObject(params).createReadStream();
    var isProcessed = await db
      .collection("Uploaded_Files")
      .find({ File_Name: key })
      .count();
    console.log(isProcessed);
    if (isProcessed == 0) {
      // from CSVtoJSON
      console.log("Inserting data into db...");
      await csvtojson()
        .fromStream(file)
        .subscribe(async (json) => {
          delete json.Actions;
          if (json["Contracting Agency ID"]) {
            await db.collection("FPDS_NG").insertOne(json);
            var cursor = await db
              .collection("Federal_Agency")
              .find({ Agency_ID: json["Contracting Agency ID"] })
              .count();
              console.log('hey',cursor)
            if (cursor == 0)
              await db.collection("Federal_Agency").insertOne({
                Agency_ID: json["Contracting Agency ID"],
                Agency_Name: json["Contracting Agency Name"],
              });
          }
        });
      await db.collection("Uploaded_Files").insertOne({ File_Name: key });
      console.log("Completed !!");
    } else {
      console.log(key, ": File is already processed");
    }
  } catch (err) {
    console.log(err);
    const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
    console.log(message);
    throw new Error(message);
  }
};
