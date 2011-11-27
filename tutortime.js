var App = new Ext.Application({
    name: 'TutorTime',
    useLoadMask: true,
    launch: function () {
    
    	Ext.regModel('client', {
    		idProperty: 'id',
    		fields: [
        		{ name: 'id', type: 'int' },
        		{ name: 'name', type: 'string'},
        		{ name: 'balance', type: 'int'},
        		{ name: 'student1', type: 'string' },
        		{ name: 'student2', type: 'string' },
        		{ name: 'student3', type: 'string' }
    		],
    		validations: [
        		{ type: 'presence', field: 'id' },
        		{ type: 'presence', field: 'name', message: 'Please enter a name for this client.' }
    		]
		});
		
		Ext.regStore('ClientStore', {
    		model: 'client',
    		sorters: [{
        		property: 'name',
        		direction: 'DESC'
    		}],
    		proxy: {
        		type: 'localstorage',
        		id: 'tutor-time-localstore'
   			},
   			//TODO: remove this data after testing.
   			data: [
   				{id: 1, name: 'Casey and Ron White', student1: 'Jackson White', student2: 'Marianna White', student3: 'Harrison White', balance: '100'}
   				]
		});
		
		TutorTime.views.clientEditorBottomToolbar = new Ext.Toolbar({
    		dock: 'bottom',
    		items: [
        		{ xtype: 'spacer' },
        		{
            		iconCls: 'trash',
            		iconMask: true,
            		handler: function () {
                		var currentClient = 
            TutorTime.views.clientEditor.getRecord();
            			var clientList = TutorTime.views.clientList;
            			var clientStore = clientList.getStore();
            			
            			if (clientStore.findRecord('id', currentClient.data.id))
            			{
            				clientStore.remove(currentClient);
            			}
            			clientStore.sync();
            			clientList.refresh();
            			TutorTime.views.viewport.setActiveItem('clientListContainer',{type: 'slide', direction: 'right' });
            		}
        		}
    		]
		});

		
		TutorTime.views.clientEditorTopToolbar = new Ext.Toolbar({
    		title: 'Edit Client',
    		items: [
        		{
            		text: 'Home',
            		ui: 'back',
            		handler: function () {
                		TutorTime.views.viewport.setActiveItem('clientListContainer', {type: 'slide', direction: 'right'});
            		}
        		},
        		{ xtype: 'spacer' },
        		{
            		text: 'Save',
            		ui: 'action',
            		handler: function () {
                		var clientEditor = TutorTime.views.clientEditor;
                		var currentClient = clientEditor.getRecord();
                		//update the client with the values in the form fields.
                		clientEditor.updateRecord(currentClient);
                		
                		var errors = currentClient.validate();
                		if (!errors.isValid()) {
                			currentClient.reject();
                			Ext.Msg.alert('Wait!', errors.getByField('name')[0].message, Ext.emptyFn);
                			return; 
                		}
                		
                		var clientList = TutorTime.views.clientList;
                		var clientStore = clientList.getStore();
                		
                		if (clientStore.findRecord('id', currentClient.data.id) === null) {
                		clientStore.add(currentClient);
                		} else {
                			currentClient.setDirty();
                		}
                		
                		clientStore.sync();
                clientStore.sort([{ property: 'name', direction: 'DESC'}]);
                
                		clientList.refresh();
                
                		TutorTime.views.viewport.setActiveItem('clientListContainer', {type:'slide', direction: 'right'});
            		}
        		}
    		]
		});

		
		TutorTime.views.clientEditor = new Ext.form.FormPanel({
			id: 'clientEditor',
    		items: [
	        {
            	xtype: 'textfield',
            	name: 'name',
            	label: 'Client Name',
            	required: true
        	},
        	{
            	xtype: 'textfield',
            	name: 'student1',
            	label: 'Student 1',
            	required: true
        	},
        	{
            	xtype: 'textfield',
            	name: 'student2',
            	label: 'Student 2'
        	},
        	{
            	xtype: 'textfield',
            	name: 'student3',
            	label: 'Student 3'
        	}
    		],
    		dockedItems: [
    			TutorTime.views.clientEditorTopToolbar,
    			TutorTime.views.clientEditorBottomToolbar
    		]
		});

		
		TutorTime.views.clientList = new Ext.List({
    		id: 'clientList',
    		store: 'ClientStore',
    		onItemDisclosure: function (record) {
		    	var selectedClient = record;
		    	TutorTime.views.clientEditor.load(selectedClient);
		    	TutorTime.views.viewport.setActiveItem('clientEditor', {type: 'slide', direction: 'left'});
		    	},
    		itemTpl: '<div class="list-item-name">{name}</div>' +
		        '<div class="list-item-student">{student1}&nbsp;&nbsp;&nbsp;{student2}&nbsp;&nbsp;&nbsp;{student3}</div>' +
		        '<div class="list-item-balance">${balance}</div>',
		    listeners: {
		    	'render': function (thisComponent) {
		    		thisComponent.getStore().load();
		    	}
		    }
		});

    
    	TutorTime.views.clientListToolbar = new Ext.Toolbar({
    		id: 'clientListToolbar',
    		title: 'Active Clients',
    		layout: 'hbox',
    		items: [
    			{xtype: 'spacer'},
    			{
    				id: 'newClientButton',
    				text: 'New',
    				ui: 'action',
    				handler: function () { 
    							var now = new Date();
								var clientId = now.getTime();
								var client = Ext.ModelMgr.create(
    								         { id: clientId, name: '', balance: '0', student1: '', student2: '', student3: ''},
    						                  'client' 
    						               );
					
								TutorTime.views.clientEditor.load(client);
								TutorTime.views.viewport.setActiveItem('clientEditor', {type: 'slide', direction: 'left'});
    							
					}
    			}
    		]
		});


        TutorTime.views.clientListContainer = new Ext.Panel({
            id : 'clientListContainer',
            layout : 'fit',
            html: 'This is the client list container',
            dockedItems: [TutorTime.views.clientListToolbar],
            items: [TutorTime.views.clientList]
        });

        TutorTime.views.viewport = new Ext.Panel({
            fullscreen : true,
            layout : 'card',
            cardAnimation : 'slide',
            items: [
            	TutorTime.views.clientListContainer,
            	TutorTime.views.clientEditor
            	]
        });
    }
})