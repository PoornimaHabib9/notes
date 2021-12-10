import * as sst from "@serverless-stack/resources";
import * as ec2 from '@aws-cdk/aws-ec2'
import * as rds from '@aws-cdk/aws-rds'
// import * as secret from '@aws-cdk/aws-secretsmanager'

export default class MyStack extends sst.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const defaultDBName = "sst_db_test"
    const vpc = new ec2.Vpc(this, "default")

    const cluster = new rds.ServerlessCluster(this, "sst-db-cluster", {
      vpc: vpc,
      defaultDatabaseName: defaultDBName,
      engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(this, "ParameterGroup", "default.aurora-postgresql10")
    })
    // Create a HTTP API
    const api = new sst.Api(this, "Api", {
      routes: {
        "GET /": "src/lambda.handler",
        "GET /conn": "src/rdsConn.rdsConn"
      },
      defaultFunctionProps:{
        environment:{
          dbName: defaultDBName,
          clusterArn: cluster.clusterArn,
          secretArn: cluster.secret.secretArn
        }
      }

    });

    cluster.grantDataApiAccess(api.getFunction("GET /conn1"))

    // Show the endpoint in the output
    this.addOutputs({
      "ApiEndpoint": api.url,
      "SecretArn": cluster.secret.secretArn,
      "ClusterIdentifier": cluster.clusterIdentifier
    });
  }
}
