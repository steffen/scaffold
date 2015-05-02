Ext.define('Scaffold.Grid', {
    singleton: true,

    requires: [
        'Ext.grid.Panel',
        'Ext.grid.column.Template',
        'Ext.data.proxy.Rest'
    ],

    build: function (model, config) {
        var modelConfig = Ext.ClassManager.get(Scaffold.Config.getAppNamespace() + '.config.' + model.name),
            gridConfig = modelConfig && modelConfig.grid || {},
            columns = [],
            grid, column, columnConfig;


        columns = Ext.Array.map(model.fields, function (field) {
            columnConfig = (gridConfig.columnConfig && gridConfig.columnConfig[field.name]) || {};

            if (field.reference) {
                column = {
                    xtype: 'templatecolumn',
                    text: Ext.String.capitalize(field.name),
                    tpl: '<tpl if="' + field.name + ' && ' + field.name + '.name">{' + field.name + '.name}</tpl>',
                    flex: 1
                };
            } else {
                column = {
                    text: Ext.String.capitalize(field.name),
                    dataIndex: field.name,
                    flex: 1
                };
            }

            // temporary
            column.menuDisabled = true;

            return Ext.apply(column, columnConfig);
        });

        if (gridConfig.buildColumns) {
            columns = gridConfig.buildColumns(columns);
        }

        grid = Ext.apply({
            xtype: 'grid',
            title: model.pluralName,
            store: this.buildStore(model),
            columns: columns
        }, config);

        return grid;
    },

    buildStore: function (model) {
        var config = Ext.ClassManager.get(Scaffold.Config.getAppNamespace() + '.config.' + model.name),
            storeConfig = config && config.store || {},
            fieldsConfig = config && config.fields || {},
            store = Ext.getStore(model.name),
            fields;

        // apply custom field config
        fields = Ext.Array.map(model.fields, function (field) {
            return Ext.apply(field, fieldsConfig[field.name] || {});
        });

        if (storeConfig.buildFields) {
            fields = storeConfig.buildFields(fields);
        }

        if (!store) {
            store = Ext.merge({
                storeId: model.name,
                model: Ext.define(null, {
                    extend: 'Ext.data.Model',
                    entityName: model.name,
                    idProperty: '_id',
                    fields: fields,
                    manyToMany: model.manyToMany
                }),
                proxy: {
                    type: 'rest',
                    url: Ext.String.format(Scaffold.Config.getApiPath(), model.pluralName.toLowerCase()),
                    reader: {
                        type: 'json'
                    },
                    writer: {
                        type: 'json',
                        partialDataOptions: {
                            changes: false, // just send all the data (easier for testing), default is true
                            critical: true, // default
                            associated: true // added: also included manyToMany data
                        }
                    },
                    startParam: false,
                    limitParam: false,
                    pageParam: false,
                    noCache: false
                },
                autoLoad: true
            }, storeConfig);
        }

        return store;
    }
});