const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('harvest_quality_assessment.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});
const smartFarming = grpc.loadPackageDefinition(packageDefinition).smartFarming;

function main() {
  // Create gRPC client
  const client = new smartFarming.HarvestQualityAssessment('localhost:50053', grpc.credentials.createInsecure());

  // Make AssessHarvestQuality call
  const assessQualityRequest = {
    field_id: 'Field001',
    produce_samples: [
      {
        sample_id: 1,
        produce_type: 'Apple',
        weight: 0.2, // in kilograms
        color: 'Red',
        moisture_content: 0.6,
      },
      
    ],
    environmental_conditions: {
      temperature: 25, // in Celsius
      humidity: 0.65, // relative humidity
      rainfall: 0.2, // in millimeters
    },
  };

  client.AssessHarvestQuality(assessQualityRequest, (error, response) => {
    if (error) {
      console.error('Error making AssessHarvestQuality call:', error);
      return;
    }
    console.log('AssessHarvestQuality result:');
    console.log('Success:', response.success);
    console.log('Message:', response.message);
    console.log('Freshness Rating:', response.quality_assessment.freshness_rating);
    console.log('Sweetness Rating:', response.quality_assessment.sweetness_rating);
    console.log('Firmness Rating:', response.quality_assessment.firmness_rating);
  });

  // Make GetEnvironmentalConditions call
  const getEnvironmentalConditionsRequest = {
    field_id: 'Field001',
  };

  client.GetEnvironmentalConditions(getEnvironmentalConditionsRequest, (error, response) => {
    if (error) {
      console.error('Error making GetEnvironmentalConditions call:', error);
      return;
    }
    console.log('GetEnvironmentalConditions result:');
    console.log('Temperature:', response.temperature, '°C');
    console.log('Humidity:', response.humidity * 100, '%');
    console.log('Rainfall:', response.rainfall, 'mm');
  });
}

main();