const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('harvest_quality_assessment.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

const smartFarming = grpc.loadPackageDefinition(packageDefinition).smartFarming;

function AssessHarvestQuality(call, callback) {
  // Example for AssessHarvestQuality RPC
  const request = call.request;
  console.log('Received AssessHarvestQuality request:');
  console.log('Field ID:', request.field_id);
  console.log('Produce Samples:', request.produce_samples);
  console.log('Environmental Conditions:', request.environmental_conditions);
  
  
  const response = {
    success: true,
    message: 'Harvest quality assessment completed successfully',
    quality_assessment: {
      freshness_rating: 0.8,
      sweetness_rating: 0.9,
      firmness_rating: 0.7,
    },
  };
  console.log('Sending AssessHarvestQuality response:', response);
  callback(null, response);
}

function GetEnvironmentalConditions(call, callback) {
  
  const request = call.request;
  console.log('Received GetEnvironmentalConditions request:');
  console.log('Field ID:', request.field_id);
  
  const response = {
    temperature: 25, // in Celsius
    humidity: 0.65, // relative humidity
    rainfall: 0.2, // in millimeters
  };
  console.log('Sending GetEnvironmentalConditions response:', response);
  callback(null, response);
}

function main() {
  const server = new grpc.Server();
  server.addService(smartFarming.HarvestQualityAssessment.service, {
    AssessHarvestQuality: AssessHarvestQuality,
    GetEnvironmentalConditions: GetEnvironmentalConditions,
  });
  server.bindAsync(
    '0.0.0.0:50053',
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error('Error starting server:', err);
        return;
      }
      console.log(`gRPC server running on 0.0.0.0:${port}`);
      server.start();
    }
  );
}

main();
