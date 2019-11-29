# Agent to fetch config from skynet

### Command Line Opts:
```$xslt
Usage:
  skynet-config-agent [OPTIONS] <command> [ARGS]

Options: 
  -s, --status           Fetch the status of the agent.
  -p, --scopes           List allowed scopes
  -h, --help             Display help and usage details

Commands: 
  check, login, logout
```

Need to log in from command line with `key` and `secret`.



### Use In App
To use in app install the `npm module` and it will automatically fetch config as desired.

```bash
npm i git@github.com:XPrepOfficial/node-skynet-config-agent.git --save
```

In the main file yo can use the agent as below:

```javascript
const skynetConfigAgent = require("skynet-config-agent");

// returns promise, hence can do await
await skynetConfigAgent.load({
    localOnly: false, // if true will only load default values, not go to skynet. To work offline, or dev.
    env: process.env.NODE_ENV, // or some other value as env. REMEMBER you will be ONLY able to fetch config of granted envs. ex: if your token is only granted development,staging access you can never load production configs.
    map:{ // can load from JSON file aswell
        env: {
            MONGO_URL: {
                prop: 'mongo_url', // the config name to map to in skynet
                fallback: 'mongodb://localhost:27017/dd'
            }
        }
        
    }
});
```
