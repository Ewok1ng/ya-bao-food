module.exports = {
    mode: 'production',
    entry: {
        index: './src/js/index.js',
        // contacts: './src/js/contacts.js',
    },
    output: {
        filename: '[name].bundle.js',
    },
};
