const { app } = require('@azure/functions');

app.setup({
    enableHttpStream: false,
});
