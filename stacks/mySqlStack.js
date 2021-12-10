import * as sst from '@serverless-stack/resources'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as rds from '@aws-cdk/aws-rds'

export default class mySqlStack extends sst.Stack{
    constructor(scope,id,props){
        super(scope,id,props)

        const defaultDatabaseName="sst_db_test_mysql"
        const vpc = new ec2.Vpc(this,"default")

        const cluster = new rds.ServerlessCluster(this,"sst-db-cluster-mysql",{
            vpc:vpc,
            defaultDatabaseName:defaultDatabaseName,
            engine:rds.DatabaseClusterEngine.AURORA_MYSQL,
            parameterGroup:rds.ParameterGroup.fromParameterGroupName(this,"ParameterGroup","default.aurora-mysql5.7")
        })

        const api = new sst.Api(this,"Api",{
            routes:{
                "GET /insert":"src/rdsConn.rdsConn"
            },
            defaultFunctionProps:{
                environment:{
                    dbName:defaultDatabaseName,
                    secretArn:cluster.secret.secretArn,
                    clusterArn:cluster.clusterArn,
                    clusterIdentifier:cluster.clusterIdentifier
                }
                
            }
        })

        cluster.grantDataApiAccess(api.getFunction("GET /insert"))

        this.addOutputs({
            "ApiEndpoint":api.url,
            "clusterIdentifier":cluster.clusterIdentifier,
            "secretArn":cluster.secret.secretArn
        })
    }
}