sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/json/JSONModel",
], function (Controller, ODataModel, JSONModel,MessageToast, BusyIndicator) {
    "use strict";
    let listData =[]
    let tableData;
    return Controller.extend("zmatconsump.controller.View1", {

        onInit() {
            // this.oDataModel = new ODataModel("/sap/opu/odata/sap/Z_MATERIALCONSUMPTION_REP", {
            //     defaultCountMode: "None"
            // });
            // this.getView().setModel(this.oDataModel);
            
        },
        
        setDataModel: function () {
            debugger
            let oView = this.byId("MainList");

            // Check if oView is valid
            if (!oView) {
                console.error("MainList view not found.");
                return;
            }
            let oModel = new JSONModel();
            oView.setModel(oModel, "TableData");
            oModel.setProperty("/TradeData", listData);
           
        },
        getValueHelpPlant: async function () {
            debugger
            var oBusyDialog = new sap.m.BusyDialog({
                text: "Please wait"
            });
        
            var that = this;
            oBusyDialog.open();
        
            var oInput1 = this.byId("plant");
        
            if (!this._oValueHelpDialog) {
                this._oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog("BeamNo", {
                    supportMultiselect: false,
                    supportRangesOnly: false,
                    stretch: sap.ui.Device.system.phone,
                    key: "Plant",
                    descriptionKey: "Plant",
                    filterMode: true,
                    ok: function (oEvent) {
                        var valueset = oEvent.getParameter("tokens")[0].getAggregation("customData")[0].getProperty("value").beamno;
                        oInput1.setValue(valueset);
                        that.Beamno = valueset;
                        that.getDetails();
                        that._oValueHelpDialog.close();
                    },
                    cancel: function () {
                        that._oValueHelpDialog.close();
                    }
                });
            }
        
            var oTable = await this._oValueHelpDialog.getTableAsync();
        
            var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
                advancedMode: true,
                filterBarExpanded: true,
                showGoOnFB: !sap.ui.Device.system.phone,
                filterGroupItems: [
                    new sap.ui.comp.filterbar.FilterGroupItem({
                        groupTitle: "foo",
                        groupName: "gn1",
                        name: "n1",
                        label: "Beam No.",
                        control: new sap.m.Input()
                    })
                ],
                search: function (oEvt) {
                    oBusyDialog.open();
                    var beamno = oEvt.getParameter("selectionSet")[0].getValue();
                    if (beamno === "") {
                        oTable.bindRows({
                            path: "/BeamNoF4",
                            parameters: { "$top": "5000" }
                        });
                    } else {
                        oTable.bindRows({
                            path: "/BeamNoF4",
                            parameters: { "$top": "5000" },
                            filters: [new sap.ui.model.Filter("beamno", sap.ui.model.FilterOperator.Contains, beamno)]
                        });
                    }
                    oBusyDialog.close();
                }
            });
        
            this._oValueHelpDialog.setFilterBar(oFilterBar);
        
            var oColModel = new sap.ui.model.json.JSONModel();
            oColModel.setData({
                cols: [
                    { label: "Beam No.", template: "beamno" }
                ]
            });
        
            oTable.setModel(oColModel, "columns");
        
            var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/Z_MATERIALCONSUMPTION_REP");
            oTable.setModel(oModel);
        
            oBusyDialog.close();
        
            this._oValueHelpDialog.open();
        
            oTable.bindRows({
                path: "/BeamNoF4",
                parameters: { "$top": "5000" }
            });
        },
        


    
        browseAndUpload: function (oEvent) {
            // debugger
            var that = this;
            var file = oEvent.getParameter("files") && oEvent.getParameter("files")[0];
            if (!file) {
                console.error("No file selected.");
                return;
            }
            if (window.FileReader) {
                var reader = new FileReader();
                reader.onloadstart = function () {
                    console.log("File reading started...");
                };
                reader.onload = function (e) {
                    var data = e.target.result;
                    try {
                        var workbook = XLSX.read(data, {
                            type: 'binary'
                        });
                        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                            console.error("No sheets found in the Excel file.");
                            return;
                        }
                        var excelData = [];
                        var headers = [];
                        workbook.SheetNames.forEach(function (sheetName) {
                            var worksheet = workbook.Sheets[sheetName];
                            excelData = XLSX.utils.sheet_to_row_object_array(worksheet);
                            headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
                            excelData.forEach((element) => {
                                let data = {
                                    "materialcode": element["materialcode"],
                                    "material_text": element["material_text"],
                                };
                                listData.push(data);
                            });
                            console.log("Extracted Data: ", excelData);
                            that.tableData =  excelData
                            // that.setDataModel();
                        });

                    } catch (error) {
                        console.error("Error parsing the Excel file: ", error);
                    }
                };
                reader.onerror = function (error) {
                    console.error("Error reading file: ", error);
                };
                reader.readAsBinaryString(file);
            } else {
                console.error("FileReader is not supported in this browser.");
            }
        },
        getValueHelpPlant: function (oEvent) {

            
        },
        getValueHelpMaterial: function (oEvent) {
            
        },
        onClickupload: function () {
            debugger
            // let data = this.byId("MainList").getModel("TableData").getProperty("/TradeData");
            let data =  this.tableData

            if (!data.length) {
                alert("No data filled")
                return
            }
            function excelDateToJSDate(serial) {
                const date = new Date((serial - 25569) * 86400 * 1000);
                return date;
            }
            let i = 0
            let ndata = data.map((newdata) => {

                return {
                    "Quantity": newdata["Quantity"],
                    "Um":newdata["Um"],
                    "Actual_Qty": newdata["Actual_Qty"],
                    "Plant" : newdata["Plant"],
                    "Material" : newdata["Material"],
                    "Rangedate" : excelDateToJSDate(newdata["Rangedate"]),
                    "Todate" : excelDateToJSDate(newdata["Todate"]),
                    "Shift" : newdata["Shift"] || " ",
                    "Storagelocation" : newdata["Storagelocation"],
                    "matdesc" : newdata["MatDesc"]
                    
                }
               
            })

            $.ajax({
                url: '/sap/bc/http/sap/ZMATERIALCONSUMPTION',
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(ndata),
                success: function (response) {
                    debugger
                    console.log('Upload successful:', response);
                    sap.m.MessageToast.show(response);
                    that.byId("_IDGenSmartTable1").rebindTable(true);
                },

                error: function (error) {
                    console.error('Error during upload:', error);
                    sap.m.MessageToast.show("Upload failed: " + (error.responseText || "Unknown error"));
                }
            });

        },
        
        onClickExport: function (oEvent) {
            debugger;
           
            const selectedIndices = this.byId("_IDGenTable").getSelectedIndices();
            const selectedData = [];

            for (let i = 0; i < selectedIndices.length; i++) {
                const context = this.byId("_IDGenTable").getContextByIndex(selectedIndices[i]);
                if (context) {
                    let rowData = {}
                    rowData['Plant'] = context.getObject('plant');
                    rowData['Material'] = context.getObject('material');
                    rowData['Rangedate'] = context.getObject('rangedate');
                    rowData['Todate'] = context.getObject('todate');
                    rowData['Shift'] =  context.getObject('shift')
                    rowData['Quantity'] = context.getObject('quantity');
                    rowData['Um'] = context.getObject('um');
                    rowData['Actual_Qty'] = context.getObject('actual_qty');
                    rowData['Difference'] = context.getObject('difference');
                    rowData['Storagelocation'] = context.getObject('storagelocation');
                    rowData['MatDesc'] = context.getObject('matdesc');
                    selectedData.push(rowData);
                }
            }

            if (selectedData.length === 0) {
                return;
            }

            const csv = this.convertToCSV(selectedData);
            // this.downloadCSV(csv, "table_data.csv");
        },convertToCSV:  function (objArray, fileName = "ExportedData.xlsx") {
            const array = typeof objArray !== "object" ? JSON.parse(objArray) : objArray;
        
            // Create worksheet from JSON array
            const worksheet = XLSX.utils.json_to_sheet(array);
        
            // Create a new workbook and append the worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        
            // Export to Excel file
            XLSX.writeFile(workbook, fileName);
        },
        navigatePage: function() {
            this.getOwnerComponent().getRouter().navTo("RouteView2");
            history.go(0);
        }
       
        
    });
});

