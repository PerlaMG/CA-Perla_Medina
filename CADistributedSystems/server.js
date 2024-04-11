const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

// Load proto files
const PROTO_PATH = './path/to/your/proto/files';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const harvestMonitoringProto = grpc.loadPackageDefinition(packageDefinition).HarvestMonitoring;
const harvestQualityAssessmentProto = grpc.loadPackageDefinition(packageDefinition).HarvestQualityAssessment;

// Implement service methods
const monitoringServer = new grpc.Server();
const qualityAssessmentServer = new grpc.Server();

// Define service logic for HarvestMonitoring
monitoringServer.addService(harvestMonitoringProto.HarvestMonitoring.service, {
    UpdateProgress: (call, callback) => {
        // Logic to handle update progress request
        console.log('Received progress update:', call.request);
        // Process the request and send response
        callback(null, { success: true });
    },
    GetHarvestStatus: (call, callback) => {
        // Logic to handle get harvest status request
        // Example implementation:
        const status = {
            progress: 75,
            issues_encountered: ['Pest infestation'],
        };
        callback(null, status);
    },
});

// Define service logic for HarvestQualityAssessment
qualityAssessmentServer.addService(harvestQualityAssessmentProto.HarvestQualityAssessment.service, {
    assessHarvestQuality: (call, callback) => {
        // Logic to handle assess harvest quality request
        console.log('Received quality assessment request:', call.request);
        // Process the request and send response
        const response = {
            quality_grade: "Good",
            freshness_rating: 0.9
        };
        callback(null, response);
    },
});

// Start servers
const monitoringPort = 50052;
const qualityAssessmentPort = 50053;

monitoringServer.bind(`localhost:${monitoringPort}`, grpc.ServerCredentials.createInsecure());
monitoringServer.start();
console.log(`Monitoring server started on port ${monitoringPort}`);

qualityAssessmentServer.bind(`localhost:${qualityAssessmentPort}`, grpc.ServerCredentials.createInsecure());
qualityAssessmentServer.start();
console.log(`Quality assessment server started on port ${qualityAssessmentPort}`);