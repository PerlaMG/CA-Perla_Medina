const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('harvest_prediction.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});
const smartFarming = grpc.loadPackageDefinition(packageDefinition).smartFarming;

function PredictHarvest(call) {
  const request = call.request;
  const parameters = request.parameters;

  // Calculate the predicted harvest dates based on the current date and days to maturity
  const currentDate = new Date();
  const harvestDates = {
    15: new Date(currentDate.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    30: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    45: new Date(currentDate.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
  };

  // Simulate streaming responses
  for (const daysToMaturity in harvestDates) {
    if (harvestDates.hasOwnProperty(daysToMaturity)) {
      const predictedHarvestDate = harvestDates[daysToMaturity];
      const predictedYield = parameters.planting_density * parameters.average_plant_weight * daysToMaturity;

      const response = {
        predicted_yield: predictedYield,
        predicted_harvest_date: predictedHarvestDate,
        success: true,
        message: `Prediction for ${daysToMaturity} days completed successfully`,
      };
      call.write(response);
    }
  }
  call.end(); // End the stream
}

function main() {
  const server = new grpc.Server();
  server.addService(smartFarming.HarvestPrediction.service, {
    PredictHarvest: PredictHarvest,
  });
  server.bindAsync(
    '0.0.0.0:50052',
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error('Failed to start server:', err);
        return;
      }
      console.log(`gRPC server running on 0.0.0.0:${port}`);
      server.start();
    }
  );
}

main();