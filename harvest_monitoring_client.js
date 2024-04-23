const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the protocol buffer
const packageDefinition = protoLoader.loadSync('harvest_monitoring.proto', {
  keepCase: true, // Keep field names in the original case
  longs: String, // Represent longs as strings
  enums: String, // Represent enums as strings
  arrays: true, // Represent repeated fields as arrays
});

// Load the gRPC service from the protocol buffer definition
const smartFarming = grpc.loadPackageDefinition(packageDefinition).smartFarming;

// Create a new gRPC client
const client = new smartFarming.HarvestMonitoring('localhost:50051', grpc.credentials.createInsecure());

// Example usage of UpdateProgress
const updateProgressStream = client.updateProgress();

updateProgressStream.on('data', (response) => {
  console.log('Response from server:', response);
});

updateProgressStream.on('end', () => {
  console.log('Update progress stream ended');
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

// Example usage of GetHarvestStatus
console.log('Requesting harvest status...');
const getHarvestStatusStream = client.getHarvestStatus({});

getHarvestStatusStream.on('data', (response) => {
  console.log('Harvest status received:', response);
});

getHarvestStatusStream.on('end', () => {
  console.log('Get harvest status stream ended');
});

getHarvestStatusStream.on('error', (error) => {
  console.error('Error getting harvest status:', error);
});