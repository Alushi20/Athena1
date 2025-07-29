import {Client, Databases} from 'react-native-appwrite'
import {Platform} from "react-native";

const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: '67bb632a001de339c317',
    dbId:"67bc1b9400215f978730",
    col:{
        Users: "Users",
    }
}

const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)

switch(Platform.OS){
    case 'android':
        client.setPlatform("com.GalWise.chat");
        break
}

const database = new Databases(client)

export { database, config, client };
