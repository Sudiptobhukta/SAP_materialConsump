sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
], function (Controller, MessageToast) {
	"use strict";

	return Controller.extend("zmatconsump.controller.View2", {
		onInit: function () {
		
		},
		onClickdelete: function (oEvent) {
			debugger
			var tableData = this.byId("_IDGenTable1");
			var selectedIndex =  this.byId('_IDGenTable1').getSelectedIndices();
			var selectedRow = []
			function convertToDate(params) {
				const inputDateString = params;
				const date = new Date(inputDateString);

				const year = date.getFullYear();
				
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');

				const formattedDate = `${year}${month}${day}`;
				return formattedDate;
			}
			for (var i=0 ; i < selectedIndex.length ; i++){
				var context = tableData.getContextByIndex(selectedIndex[i])
				if(context){
					let rowData = {}
                    rowData['Plant'] = context.getObject('Plant');
                    rowData['Material'] = context.getObject('Material');
					rowData['rangedate'] =  convertToDate(context.getObject('Fromdate'));
					rowData['Todate'] =  convertToDate(context.getObject('Todate'));
					selectedRow.push(rowData)
				}

			}
			if (selectedRow.length == 0){
				MessageToast.show("Select before Deleting");
				return;
			}else{ 
			$.ajax({
				url: '/sap/bc/http/sap/ZMATERIALCONSUMPTION?delete=DELETE',
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(selectedRow),
				success: function (response) {
                    // debugger
                    console.log('Upload successful:', response);
                    sap.m.MessageToast.show(response);
					history.go(0);
                    that.byId("_IDGenSmartTable1").rebindTable(true);
                },
				error: function (error) {
                    console.error('Error during upload:', error);
                    MessageToast.show("Upload failed: " + (error.responseText || "Unknown error"));
                }
			})
			}
		}

	});
});
