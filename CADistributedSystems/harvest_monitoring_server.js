const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the protocol buffer definition file
const packageDefinition = protoLoader.loadSync('harvest_monitoring.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

// Load the gRPC service from the protocol buffer definition
const smartFarming = grpc.loadPackageDefinition(packageDefinition).smartFarming;

// Create a new gRPC server
const server = new grpc.Server();

// Add service implementations to the serv
server.addService(smartFarming.HarvestMonitoring.service, {
  // Implement the updateProgress RPC method
  updateProgress: updateProgress, 
  // Implement the getHarvestStatus RPC method
  getHarvestStatus: getHarvestStatus,
});


// Implementation of the updateProgress RPC method
function updateProgress(call) {
  console.log('Receiving progress updates...');
  call.on('data', (request) => {
    console.log('Received ProgressUpdateRequest:', request);
    call.write({
      success: true,
      message: 'Progress updated successfully',
    });
  });

  call.on('end', () => {
    console.log('Finished receiving progress updates');
    call.end();
  });
}

function getHarvestStatus(call) {
  console.log('Sending harvest status...');
  const response = {
    harvestStatus: {
      progress: 1.0,
      issuesEncountered: [
        { code: '001', message: 'Issue 1', severity: 0.5 }, // Example issue 1
        { code: '002', message: 'Issue 2', severity: 0.7 }, // Example issue 2
      ],
      statusMessage: 'Harvest completed',  // Example status message
      operatorId: 'operator123',
      startTime: { seconds: Date.now() / 1000 },
      endTime: { seconds: (Date.now() + 3600000) / 1000 }, // Example end time (1 hour from now)
    },
    success: true,
    message: 'Harvest status retrieved successfully',
  };

  // Send the response to the client
  call.write(response);
  // Close the call
  call.end();
}

server.bindAsync('localhost:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Failed to start server:', err);
  } else {
    console.log('Server started, listening on port', port);
  }
});