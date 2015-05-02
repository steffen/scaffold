Ext.define('Scaffold.Config', {
    singleton: true,

    config: {
        appNamespace: 'CM',
        apiModelsPath: '/api/models',
        apiPath: null
    },

    models: null,

    init: function (config) {
        Ext.Ajax.request({
            url: this.getApiModelsPath(),
            method: 'GET',
            success: function (response) {
                var responseJSON = Ext.decode(response.responseText);

                this.models = responseJSON;

                config.callback.call(this);
            },
            scope: this
        });
    }

});