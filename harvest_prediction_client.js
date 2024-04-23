const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('harvest_prediction.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});
const smartFarming = grpc.loadPackageDefinition(packageDefinition).smartFarming;

function main() {
  const client = new smartFarming.HarvestPrediction('localhost:50052', grpc.credentials.createInsecure());

  const parameters = {
    planting_density: 10,
    average_plant_weight: 0.2,
  };

  const call = client.PredictHarvest({ parameters });

  call.on('data', (response) => {
    console.log(`Predicted Yield: ${response.predicted_yield}`);
    console.log(`Predicted Harvest Date: ${response.predicted_harvest_date}`);
    console.log(`Success: ${response.success}`);
    console.log(`Message: ${response.message}`);
    console.log();
  });

  call.on('end', () => {
    console.log('Server stream ended');
  });

  call.on('error', (error) => {
    console.error('Error:', error.message);
  });

  call.on('status', (status) => {
    console.log('Status:', status);
  });
}

main();