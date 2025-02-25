import { DynamoDBClient, PutItemCommand, DeleteItemCommand, UpdateItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoDB = new DynamoDBClient({ region: "us-east-2" });

export async function helloUser(event) {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Hola ${event.pathParameters.name} testFinal`,
        input: event,
      },
      null,
      2
    ),
  };
}

export async function createUser(event) {
  try {
    const body = JSON.parse(event.body);
    const userID = String(body.id);

    if (!body.id || !body.name || !body.email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "id, name y email son requeridos" }),
      };
    }

    const params = {
      TableName: "UsersTable",
      Item: marshall({
        id: userID,
        name: body.name,
        email: body.email,
        createdAt: new Date().toISOString(),
      }),
    };

    const command = new PutItemCommand(params)
    await dynamoDB.send(command)

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: `Usuario creado`,
        user: params.Item,
      }),
    };
  } catch (error) {
    console.log("Error al crear el usuario:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error al crear el usuario" }),
    };
  }
}

export async function deleteUser(event) {
  try{
    const userId = event.pathParameters.id;

    if (!userId){
      return{
        statusCode:400,
        body: JSON.stringify({error: "Id de usuario requerio para realizar la eliminacion"})
      }
    }

    const params = {
      TableName: "UsersTable",
      Key: marshall({id:userId})
    }

    const command = new DeleteItemCommand(params)
    await dynamoDB.send(command);
    
    return{
      statusCode:200,
      body: JSON.stringify({message: `Usuario con id ${userId} eliminado`})
    }
  }catch(error){
    console.log("Error al eliminar usuario", error);
    return{
      statusCode: 500,
      body: JSON.stringify({error: "Error al eliminar el usuario"})
    }
  }

}

export async function getAllUsers(event) {
  const params = {
    TableName: "UsersTable",
  };

  try {
    const command = new ScanCommand(params)
    const data = await dynamoDB.send(command)

    const users = data.Items ? data.Items.map((item) => unmarshall(item)) : [];

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Usuarios obtenidos correctamente",
        users: users,
      }),
    };
  } catch (error) {
    console.log("Error al obtener usuarios", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error al obtener los usuarios",
        error: error.message,
      }),
    };
  }
}
