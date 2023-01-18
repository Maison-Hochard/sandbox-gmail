require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss');
require('dotenv').config();

const commander = require("commander");
const axios = require('axios');

commander
    .version("1.0.0")
    .usage('[options]')
    .option('-d, --demo <string>', 'exemple option')
    .parse(process.argv);

const program = commander.opts();

async function launchScript() {
    const response = await axios.get('https://random-data-api.com/api/users/random_user');
    console.log(response.data); // Ceci est un simple d'exemple d'appel API en utilisant axios
    console.log(process.env.ENV_EXEMPLE); // Ceci est un simple d'exemple d'utilisation d'une variable d'environnement
    console.log(program.demo); // Ceci est un simple d'exemple d'utilisation d'une option si la commande "node script.js -d test_string" est utilisée
}

launchScript()
    .then(_ => {
        console.log("Script ended");
        process.exit();
    })
    .catch(e => {
        console.log("Script failed: " + e);
        process.exit();
    });
