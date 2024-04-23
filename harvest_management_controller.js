const readline = require('readline');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the protobuf definitions for all services
const monitoringPackageDefinition = protoLoader.loadSync('harvest_monitoring.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

const predictionPackageDefinition = protoLoader.loadSync('harvest_prediction.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

const qualityAssessmentPackageDefinition = protoLoader.loadSync('harvest_quality_assessment.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

// Load the services from the protobuf definitions
const smartFarmingMonitoring = grpc.loadPackageDefinition(monitoringPackageDefinition).smartFarming;
const smartFarmingPrediction = grpc.loadPackageDefinition(predictionPackageDefinition).smartFarming;
const smartFarmingQualityAssessment = grpc.loadPackageDefinition(qualityAssessmentPackageDefinition).smartFarming;

// Create gRPC clients for each service
const monitoringClient = new smartFarmingMonitoring.HarvestMonitoring('localhost:50051', grpc.credentials.createInsecure());
const predictionClient = new smartFarmingPrediction.HarvestPrediction('localhost:50052', grpc.credentials.createInsecure());
const qualityAssessmentClient = new smartFarmingQualityAssessment.HarvestQualityAssessment('localhost:50053', grpc.credentials.createInsecure());

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for action selection
function promptAction() {
  console.log('Select an action:');
  console.log('1. Harvest Monitoring');
  console.log('2. Harvest Prediction');
  console.log('3. Harvest Quality Assessment');
  console.log('4. Exit');
  rl.question('Enter your choice: ', (choice) => {
    switch (choice.trim()) {
      case '1':
        getHarvestStatus();
        updateHarvestProgress();
        break;
      case '2':
        predictHarvest();
        break;
      case '3':
        assessHarvestQuality();
        break;
      case '4':
        rl.close();
        process.exit(0);
      default:
        console.log('Invalid choice. Please enter a number between 1 and 4.');
        promptAction();
        break;
    }
  });
}

// Function to get harvest status
function getHarvestStatus() {
    console.log('Requesting harvest status...');
    const getHarvestStatusStream = monitoringClient.getHarvestStatus({});
  
    getHarvestStatusStream.on('data', (response) => {
      console.log('Harvest status received:', response);
    });
  
    getHarvestStatusStream.on('end', () => {
      console.log('Get harvest status stream ended');
      promptAction();
    });
  
    getHarvestStatusStream.on('error', (error) => {
      console.error('Error getting harvest status:', error);
      promptAction();
    });
  }
  
  // Function to update harvest progress
  function updateHarvestProgress() {
    const updateProgressStream = monitoringClient.updateProgress();
  
    updateProgressStream.on('data', (response) => {
      console.log('Response from server:', response);
    });
  
    updateProgressStream.on('end', () => {
      console.log('Update progress stream ended');
      promptAction();
    });
  
    // Send some progress updates
    console.log('Sending progress updates...');
    for (let i = 0; i < 5; i++) {
      const request = {
        fieldId: 'field1',
        progressUpdate: {
          progress: i * 0.2,
          statusMessage: `${(i + 1) * 20}% completed`,
        },
      };
      console.log('Sending progress update:', request);
      updateProgressStream.write(request);
    }
  
    updateProgressStream.end();
  }
  

// Function to handle Harvest Prediction action
function predictHarvest() {
    // Implement logic for Harvest Prediction
    const request = {
      crop_type: 'Wheat',
      field_id: 'Field001',
      parameters: {
        planting_density: 10, // Number of plants per square meter
        average_plant_weight: 0.2, // Average weight of a single plant (in kg)
      },
    };
  
    const call = predictionClient.PredictHarvest(request);
  
    call.on('data', (response) => {
      const predictedYield = response.predicted_yield;
      const successMessage = response.message;
      const predictedHarvestDate = new Date(response.predicted_harvest_date);
      const currentDate = new Date();
      const daysToMaturity = Math.round((predictedHarvestDate - currentDate) / (1000 * 60 * 60 * 24)); // Calculate days to maturity
  
      console.log(`Predicted Yield: ${predictedYield}`);
      console.log(`Predicted Harvest Date: ${predictedHarvestDate.toDateString()} (${daysToMaturity} days from now)`);
      console.log(`Success: ${successMessage}`);
      console.log();
    });
  
    call.on('end', () => {
      console.log('Prediction stream ended');
      promptAction();
    });
  
    call.on('error', (error) => {
      console.error('Error predicting harvest:', error);
      promptAction();
    });
  }

// Function to handle Harvest Quality Assessment action
function assessHarvestQuality() {
  // Implement Harvest Quality Assessment
  const request = {
    field_id: 'Field001',
    produce_samples: [
      {
        sample_id: 1,
        produce_type: 'Apple',
        weight: 0.2, // in kilograms
        color: 'Red',
        moisture_content: 0.6,
      }
    ],
    environmental_conditions: {
      temperature: 25, // in Celsius
      humidity: 0.65, // relative humidity
      rainfall: 0.2, // in millimeters
    },
  };

  qualityAssessmentClient.AssessHarvestQuality(request, (error, response) => {
    if (error) {
      console.error('Error assessing harvest quality:', error);
      promptAction();
    } else {
      console.log('\nAssessHarvestQuality result:');
      console.log('Success:', response.success);
      console.log('Message:', response.message);
      console.log('Freshness Rating:', response.quality_assessment.freshness_rating.toFixed(2));
      console.log('Sweetness Rating:', response.quality_assessment.sweetness_rating.toFixed(2));
      console.log('Firmness Rating:', response.quality_assessment.firmness_rating.toFixed(2));
      // Call GetEnvironmentalConditions after AssessHarvestQuality
      getEnvironmentalConditions();
    }
  });
}

// Function to get environmental conditions after quality assessment
function getEnvironmentalConditions() {
  const request = {
    field_id: 'Field001',
  };

  qualityAssessmentClient.GetEnvironmentalConditions(request, (error, response) => {
    if (error) {
      console.error('Error getting environmental conditions:', error);
      promptAction();
    } else {
      console.log('\nGetEnvironmentalConditions result:');
      console.log('Temperature:', response.temperature, '°C');
      console.log('Humidity:', response.humidity * 100, '%');
      console.log('Rainfall:', response.rainfall, 'mm');
      promptAction();
    }
  });
}

// Start the command-line controller
console.log('Welcome to the Harvest Management System!');
promptAction();