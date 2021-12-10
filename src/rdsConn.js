import client from 'data-api-client'

export async function rdsConn(event) {
    const counterName = event.queryStringParameters.counterName
    const counter = parseInt(event.queryStringParameters.counter)
    console.log(process.env.secretArn)
    const db = client({
        database: process.env.dbName,
        secretArn: process.env.secretArn,
        resourceArn: process.env.clusterArn
    })
    // ("SHOW TABLES LIKE 'tblCounter';")//
    try {
        let result = await db.query(`Select Count(*) from information_schema.TABLES where table_name='tblcounter'`)
        if (result.records[0].count > 0) {
            try {
                const records = await db.query(`Insert Into tblcounter(counterName,tally) values ('${counterName}',${counter});`)
                return {
                    statusCode: 200,
                    body: `hello world rds conn ${records}`
                }
            } catch (e) {
                return {
                    statusCode: 500,
                    body: `Error ${e}`
                }
            }

        } else {
            try {
                await db.query("Create Table tblcounter(counterName text,tally integer)")
                try {
                    const records = await db.query(`Insert Into tblcounter values ('${counterName}',${counter});`)
                    return {
                        statusCode: 200,
                        body: `hello world rds conn ${records}`
                    }
                } catch (e) {
                    return {
                        statusCode: 500,
                        body: `Error ${e}`
                    }
                }
            } catch (e) {
                return {
                    statusCode: 500,
                    body: `Error ${e}`
                }
            }
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: `Error ${err}`
        }
    }
}