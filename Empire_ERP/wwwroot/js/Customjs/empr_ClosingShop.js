var empr_ClosingShop = {
    isValueAssigned: false,
    ClosingData: [],
    ClosingBalance: 0,
    tData: TargetData.data[0],
    sData: (TargetData && TargetData.data2) ? TargetData.data2 : [],
    InitEvents: function () {

        $(document).ready(function () {
            debugger;
            console.log("targetData", empr_ClosingShop.tData)
            try {
                empr_ClosingShop.updateProgressBar(empr_ClosingShop.tData.per);
            } catch (error) {
                console.warn("updateProgressBar failed, skipping:", error);
            }
            //empr_ClosingShop.updateProgressBar(empr_ClosingShop.tData.per);
            empr_ClosingShop.InitQuickSearchGrid();

            empr_ClosingShop.SetDataInTargetModel(empr_ClosingShop.tData);
            empr_ClosingShop.SetSalesmanWiseSales(empr_ClosingShop.sData);
            empr_ClosingShop.InitReportType();
            debugger;
            $('#BtnGet').click(function () {
                empr_ClosingShop.InitQuickSearchGrid();
            });

            $('#PBAR').click(function () {
                debugger;
                //$("#PMODEL").show();
                //if (empr_ClosingShop.tData == null || empr_ClosingShop.tdate == undefined) {

                //} else {
                    $('#PMODEL').modal('show');
                //}
                //empr_ClosingShop.InitQuickSearchGrid();
            });

            $("#SyncData").click(function () {

                if (!navigator.onLine) {
                    $("#internetModal").modal("show");
                    return;
                }

                $('#Loader').appendTo('body').css({ display: 'flex' });

                $.ajax({
                    url: '/ClosingShop/GetSyncData',
                    type: 'GET',
                    success: function (data) {

                        empr_helper.notify(data.msg, data.msgType);

                        // Response ke baad form reload
                        location.reload();
                    },
                    error: function () {
                        empr_helper.notify("Server Error", 0);
                    },
                    complete: function () {
                        $("#Loader").hide();
                    }
                });

            });
            $('#BtnClosed').click(function () {

                empr_ClosingShop.PrintModal();

            });
            $('body').on('click', '#printModalClose', function () {
                debugger;
              
                    $('#printModal').modal('hide');

            });

            document.querySelectorAll(".close").forEach(function (closeBtn) {
                closeBtn.addEventListener("click", function () {
                    $('#printModal').modal('hide');
                });
            });
            $('#printButton').on('click', function () {
                debugger;

                var dataModel = empr_ClosingShop.GetDataToSave();
                console.log('AliBaba', dataModel)
                empr_ClosingShop.SaveClosing(dataModel)
                const printContent = document.getElementById('slipPreview').innerHTML;
                const printFrame = document.createElement('iframe');
                printFrame.style.position = 'absolute';
                printFrame.style.top = '-10000px'; // Hide the iframe
                document.body.appendChild(printFrame);
                const frameDoc = printFrame.contentWindow || printFrame.contentDocument;
                frameDoc.document.open();
                frameDoc.document.write(`
                                        <html>  <head>
                                                    <style>
                                                        body {
                                                            width: 80mm;
                                                        }
                                                        table {
                                                            width: 100%;
                                                            border-collapse: collapse;
                                                        }
                                                        th, td {
                                                            padding: 3px;
                                                        }
                                                        tbody tr:last-child {
                                                            border-bottom: 0.5px solid black !important;
                                                        }
                                                    </style>
                                                </head>
                                            <body>
                                            ${printContent}
                                            </body>
                                        </html>
                                    `);
                frameDoc.document.close();


                empr_ClosingShop.UpdateClosedData();
                $('#printModal').modal('hide');

                // Trigger print in the iframe
                frameDoc.focus(); // Focus on the iframe
                frameDoc.print(); // Trigger the print

                // Remove the iframe after printing
                setTimeout(() => {
                    document.body.removeChild(printFrame);
                }, 1000);

            });
        });
    },
    updateProgressBar: function (value) {
        debugger;
        value = Math.abs(value); // make it positive
        value = Math.min(Math.max(value, 0), 100); // clamp between 0 and 100

        $("#pbFill").css("width", value + "%");
        $("#PPER").text(value + "%");
    },
    formatCurrency: function (amount) {
        return new Intl.NumberFormat('en-US').format(amount);
    },

    //SetDataInTargetModel: function (data) {
    //    debugger;
    //    var damt = empr_ClosingShop.formatCurrency(data.dueamt)
    //    var samt = empr_ClosingShop.formatCurrency(data.samt)
    //    var tamt = empr_ClosingShop.formatCurrency(data.tamt)
    //    debugger;
    //    $("#bName").text(data.bname);
    //    $("#fDate").text(data.fromdate);
    //    $("#tDate").text(data.todate);
    //    $("#dDays").text(data.duedays);
    //    //$("#due").text(damt);
    //    //var damtValue = damt;
    //    debugger;
    //    var damtClean = damt.replace(/,/g, "");
    //    var damtValue = parseFloat(damtClean);
    //    if (!isNaN(damtValue) && damtValue < 0) {
    //        $("#due").html(`<span style="color:red">(${Math.abs(damtValue).toLocaleString()})</span>`);
    //    } else if (!isNaN(damtValue)) {
    //        $("#due").text(damtValue.toLocaleString());
    //    } else {
    //        $("#due").text("");
    //    }
    //    $("#tAmt").text(tamt);
    //    $("#sAmt").text(samt);
    //    $("#per").text(data.per);
    //    value = Math.abs(data.per); // make it positive
    //    value = Math.min(Math.max(value, 0), 100);
    //    $("#perBar").css("width", value + "%");
    //    $("#per").text(value + "%");
    //},
    SetDataInTargetModel: function (data) {
        debugger;
        data = data || {};
        var damt = empr_ClosingShop.formatCurrency(data.dueamt || 0);
        var samt = empr_ClosingShop.formatCurrency(data.samt || 0);
        var tamt = empr_ClosingShop.formatCurrency(data.tamt || 0);
        var per = data.per != null ? data.per : 0;
        $("#bName").text(data.bname || "");
        $("#fDate").text(data.fromdate || "");
        $("#tDate").text(data.todate || "");
        $("#dDays").text(data.duedays || "");
        try {
            var damtClean = (damt || "0").replace(/,/g, "");
            var damtValue = parseFloat(damtClean);
            if (!isNaN(damtValue) && damtValue < 0) {
                $("#due").html(`<span style="color:red">(${Math.abs(damtValue).toLocaleString()})</span>`);
            } else if (!isNaN(damtValue)) {
                $("#due").text(damtValue.toLocaleString());
            } else {
                $("#due").text("");
            }
        } catch (e) {
            $("#due").text("");
        }

        $("#tAmt").text(tamt);
        $("#sAmt").text(samt);
        $("#per").text(per);

        try {
            var value = Math.abs(per); // make positive
            value = Math.min(Math.max(value, 0), 100);
            $("#perBar").css("width", value + "%");
            $("#per").text(value + "%");
        } catch (e) {
            $("#perBar").css("width", "0%");
            $("#per").text("0%");
        }
    },
    SetSalesmanWiseSales: function (list) {
        var $list = $("#salesmanSalesList");
        $list.empty();
        if (!list || list.length === 0) {
            $list.append($('<div class="empire-salesman-empty"></div>').text("No salesman-wise sales"));
            return;
        }
        var grandTotal = 0;
        for (var i = 0; i < list.length; i++) {
            grandTotal += parseFloat((list[i] && list[i].total) || 0) || 0;
        }
        for (var i = 0; i < list.length; i++) {
            var item = list[i] || {};
            var name = item.sname || "";
            var amountValue = parseFloat(item.total || 0) || 0;
            var total = empr_ClosingShop.formatCurrency(item.total || 0);
            var per = grandTotal === 0 ? 0 : (amountValue / grandTotal) * 100;
            var $row = $('<div class="empire-salesman-row"></div>');
            $row.append($('<span class="empire-salesman-name"></span>').text(name));
            $row.append($('<span class="empire-salesman-per"></span>').text(per.toFixed(2) + "%"));
            $row.append($('<span class="empire-salesman-amt"></span>').text(total));
            $list.append($row);
        }
    },


    PrintModal() {
        var dataModel = empr_ClosingShop.GetDataToSave();
        debugger;
        ajaxHelper.ajaxPostJsonData(dataModel, "/ClosingShop/PrintModal", function (data) {
            if (true) {
                debugger;
                $('#slipPreview').html(data.slipHtml);
                $('#printModal').modal('show');

                $('#printModal').on('shown.bs.modal', function () {
                    setTimeout(function () {
                        var modalBody = $('#printModal .modal-body'); // Scroll the modal body, not the footer
                        console.log(modalBody[0].scrollHeight); // Check if scrollHeight is valid
                        if (modalBody[0].scrollHeight > modalBody.height()) {
                            modalBody.animate({
                                scrollTop: modalBody[0].scrollHeight
                            }, 200); // Scroll to the bottom of the modal body
                        } // Scroll to the bottom of the modal body
                    }, 100); 
                });
            }
        }, false, true);
    },
    GetDataToSave: function () {
        debugger;
        var FromDate = empr_ClosingShop.formatDate($('#FromDate').val());
        var ToDate = empr_ClosingShop.formatDate($('#ToDate').val());
        var closingBalance = empr_ClosingShop.ClosingBalance;
        var masterRecord = {
            FromDate: FromDate,
            ToDate: ToDate,
            closingBalance: closingBalance,
        }

        var detailRecords = empr_ClosingShop.ClosingData.data;
        console.log("Ali", detailRecords);
        var modelRecord = {
            Master: masterRecord,
            Detail: detailRecords
        };
        return modelRecord;
    },

    formatDate(dateString) {
        var date = new Date(dateString);
        var day = String(date.getDate()).padStart(2, '0');
        var month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        var year = date.getFullYear();
        return `${day}-${month}-${year}`;
    },
    InitQuickSearchGrid: function () {
        empr_ClosingShop.QuickSearch();
    },
    InitReportType: function () {
        ajaxHelper.ajaxGetJson("/ClosingShop/GetReportTypes", function (data) {
            debugger
            if (data.msgType == 1) {
                if (data.data.length > 0) {
                    var selectedValue = data.data[0].mD_ID;
                }
                $('#ReportType').dxSelectBox({
                    dataSource: data.data,
                    displayExpr: 'mD_NAME',
                    valueExpr: 'mD_ID',
                    value: selectedValue,
                    searchEnabled: true,
                    width: '100%',
                    placeholder: 'Search',
                    showClearButton: true,
                    dropDownOptions: {
                        height: 'auto',
                    },
                    pagingEnabled: true,
                    searchTimeout: 500,
                    onValueChanged: function (e) {
                    },
                });
            }
            else {
                empr_helper.notify(data.data, data.msgType);
            }
        }, false, true);
    },
    UpdateClosedData: function () {
        debugger;
        var FromDate = $('#FromDate').val();
        var ToDate = $('#ToDate').val();
        ajaxHelper.ajaxGetJson('/ClosingShop/UpdateClosedData?FromDate=' + FromDate + '&ToDate=' + ToDate, function (data) {
            if (data.msgType == 1) {
                empr_ClosingShop.CreateQuickSearchGrid(data.data);
            }
            else {
                empr_helper.notify(data.msg, data.msgType);
            }
        }, false, true);

    },


    QuickSearch: function () {


        debugger;
        var FromDate = $('#FromDate').val();
        var ToDate = $('#ToDate').val();

        empr_helper.fromDate = FromDate;
        empr_helper.toDate = ToDate;

        ajaxHelper.ajaxGetJson('/ClosingShop/GetClosingData?FromDate=' + FromDate + '&ToDate=' + ToDate, function (data) {
            empr_ClosingShop.ClosingData = data;
            if (data.msgType == 1) {
                empr_ClosingShop.CreateQuickSearchGrid(data.data);
            }
            else {
                empr_helper.notify(data.msg, data.msgType);
            }
        }, false, true);
    },
    SaveClosing: function (dataToSend) {
        debugger;
        $.ajax({
            url: '/ClosingShop/SaveClosing',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(dataToSend),
            success: function (response) {
                console.log("Data saved successfully", response);
            },
            error: function (xhr, status, error) {
                console.error("Error:", error);
            }
        });
    }


    ,
    CreateQuickSearchGrid: function (dataSrc) {

        console.log(dataSrc);

        var col = [
            { dataField: 'postype', caption: 'POSType', groupIndex: 0 },
            { dataField: 'acT_NAME', caption: 'Account Name', },
            { dataField: 'vcType', caption: 'VC_TYPE', visible: false },
            {
                dataField: 'qty',
                caption: 'Quantity',
                calculateCellValue: function (data) {
                    return data.qty == 0 ? '' : data.qty;
                }
            },
            {
                dataField: 'rate',
                caption: 'Rate',
                calculateCellValue: function (data) {
                    return data.rate == 0 ? '' : data.rate;
                }
            },
            {
                dataField: 'disc',
                caption: 'Discount',
                calculateCellValue: function (data) {
                    return data.disc == 0 ? '' : data.disc;
                }
            },
            {
                dataField: 'balanced',
                caption: 'Balance',
                calculateCellValue: function (data) {
                    return data.balanced == 0 ? '' : data.balanced;
                }
            }
        ];
        empr_helper.DxGridBindingForReportsWithSetting('#gridContainer', col, dataSrc, "ClosingShop");
    },
    GetData: function () {
        debugger;
        var CODE = $("#Code").val();
        var description = $("#Description").val().trim();
        var status = $("#ASTATUS").dxSelectBox('instance').option('value');
        var SelectedBranches = $("#branches_hidden").val();
        var SelectedItems = $("#design_hidden").val();
        var SelectedItemGroups = $("#group_hidden").val();
        var FromDate = $("#FromDate").val();
        var ToDate = $("#ToDate").val();
        var DiscountPercent = $("#DiscountPercent").val();
        var DiscountExpired = $("#DiscountExpired").prop('checked') ? "1" : "0";

        var modelRecord = {
            CODE: CODE,
            DESCR: description,
            ASTATUS: status,
            SELECTEDBRANCHES: SelectedBranches,
            SELECTEDITEMS: SelectedItems,
            SELECTEDITEMGROUPS: SelectedItemGroups,
            FDATE: FromDate,
            TDATE: ToDate,
            DISC: DiscountPercent,
            DISC_EXP: DiscountExpired
        }

        return modelRecord;
    },
    ValidateInfo: function () {

        var valid = true;
        var data = empr_ClosingShop.GetData();

        if (data.DESCR == '' || data.DESCR == null || data.DESCR == undefined) {
            empr_helper.notify("Please enter the description.", 2);
            valid = false;
            return valid;
        }

        if (data.SELECTEDBRANCHES == '' || data.SELECTEDBRANCHES == null || data.SELECTEDBRANCHES == undefined) {
            empr_helper.notify("Please select at least one branch.", 2);
            valid = false;
            return valid;
        }

        if ((data.SELECTEDITEMS == '' || data.SELECTEDITEMS == null || data.SELECTEDITEMS == undefined) && (data.SELECTEDITEMGROUPS == '' || data.SELECTEDITEMGROUPS == null || data.SELECTEDITEMGROUPS == undefined)) {
            empr_helper.notify("Please select at least one item or one item group.", 2);
            valid = false;
            return valid;
        }

        if (data.DISC == '' || data.DISC == null || data.DISC == undefined) {
            empr_helper.notify("Please enter the discount percentage.", 2);
            valid = false;
            return valid;
        }

        if (data.FDATE == '' || data.FDATE == null || data.FDATE == undefined) {
            empr_helper.notify("Please enter the from date.", 2);
            valid = false;
            return valid;
        }

        if (data.TDATE != null && data.FDATE != null) {
            var fromDate = new Date(data.FDATE);
            var toDate = new Date(data.TDATE);

            if (toDate < fromDate) {
                empr_helper.notify("please select valid ToDate.", 2);
                valid = false;
                return valid;
            }
        }

        return valid;
    },
    SaveInfo: function () {
        debugger;
        var data = empr_ClosingShop.GetData();
        ajaxHelper.ajaxPostJsonData(data, "/ClosingShop/Save", function (data) {
            empr_helper.notify(data.msg, data.msgType);
            if (data.msgType == 1) {
                empr_ClosingShop.ResetForm();
            }
        }, false, true);
    },
    ResetForm: function () {
        debugger;
        $('.Record input').not('#ASTATUS, .dx-texteditor-input, #FromDate').val('');
        $('#DiscountExpired').prop('checked', false);
        empr_ClosingShop.InitQuickSearchGrid();
        empr_ClosingShop.InitBranchesDDL();
        empr_ClosingShop.InitDesignNoDDL();
        empr_ClosingShop.InitItemGroupDDL();
        $('#BtnDelete, #BtnNew').hide();
    },
    GetClosingShopByCode: function (id) {

        ajaxHelper.ajaxGetJson('/ClosingShop/GetClosingShopByCode?code=' + id, function (data) {
            debugger;
            empr_ClosingShop.ResetForm();
            if (data.msgType == 1) {
                var response = data.data[0];

                $("#Code").val(response.code);
                $("#Description").val(response.descr);
                $("#ASTATUS").dxSelectBox('instance').option('value', response.astatus);
                $("#branches_hidden").val(response.bcode);
                $("#design_hidden").val(response.iteM_CODE);
                $("#group_hidden").val(response.iteM_GROUP);
                if (response.fdate != '1900-01-01') {
                    $("#FromDate").val(response.fdate);
                }

                if (response.tdate != '1900-01-01') {
                    $("#ToDate").val(response.tdate);
                }

                $("#DiscountPercent").val(response.disc);
                if (response.disC_EXP == "1") {
                    $("#DiscountExpired").prop('checked', true);
                }

                setTimeout(function () {
                    var branchRow = $('#Branches_grid').dxDataGrid('instance').option('dataSource').filter(x => x.key == response.bcode);
                    if (branchRow[0] != null) {
                        var selectedRow = branchRow[0];
                        $('#Branches_grid').dxDataGrid('instance').selectRows(selectedRow);
                    }

                    var designRow = $('#DesignNo_grid').dxDataGrid('instance').option('dataSource').filter(x => x.key == response.iteM_CODE);
                    if (designRow[0] != null) {
                        var selectedRow = designRow[0];
                        $('#DesignNo_grid').dxDataGrid('instance').selectRows(selectedRow);
                    }

                    var groupRow = $('#ItemGroup_grid').dxDataGrid('instance').option('dataSource').filter(x => x.key == response.iteM_GROUP);
                    if (groupRow[0] != null) {
                        var selectedRow = groupRow[0];
                        $('#ItemGroup_grid').dxDataGrid('instance').selectRows(selectedRow);
                    }

                }, 1000);
                $('#BtnDelete').show();
                $('#BtnNew').show();

                $('.modal').modal('hide');
            }
        }, false, true);
    },
    Delete: function (_id) {

        swal({
            title: 'Are you sure you want to remove this record?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0CC27E',
            cancelButtonColor: '#FF586B',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            confirmButtonClass: 'btn btn-success mr-5',
            cancelButtonClass: 'btn btn-danger',
            buttonsStyling: false
        }).then(function () {
            ajaxHelper.ajaxPostJsonData({ code: _id }, "/ClosingShop/Delete", function (data) {
                empr_helper.notify(data.msg, data.msgType);
                if (data.msgType == 1) {
                    window.location.reload();
                }
            }, false, true);
        });
    },
    InitBranchesDDL: function () {
        $.ajax({
            url: 'ClosingShop/GetBranches',
            method: 'GET',
            success: function (data) {
                empr_ClosingShop.MultipleDxGridBoxDropdown('#Branches', data, [{ dataField: 'key', caption: 'Code', width: '60px' }, { dataField: 'value', caption: 'Name' }], 'hidden', null, null, 'key', 'value', "#displayExpr_branches", function (selectedvalue, hidden) {
                    if (selectedvalue.selectedRowsData.length > 0) {
                        var array = selectedvalue.selectedRowsData;
                        var keys = array.map(item => item.key).join(',');
                        var values = array.map(item => item.value).join(',');
                        $('#branches_hidden').val(keys);
                        $('#displayExpr_branches').val(values);
                        empr_ClosingShop.isValueAssigned = false;
                    }
                    else {
                        $('#branches_hidden').val('');
                        $('#displayExpr_branches').val('');
                    }
                }, 'multiple');
            },
            error: function (error) {
                console.error('Error fetching data:', error);
            }
        });
    },
    InitDesignNoDDL: function (_selectedValue) {
        $.ajax({
            url: 'ClosingShop/GetDesignNos',
            method: 'GET',
            success: function (data) {
                empr_ClosingShop.MultipleDxGridBoxDropdown('#DesignNo', data, [{ dataField: 'key', caption: 'Code', width: '60px' }, { dataField: 'value', caption: 'Name' }], 'hidden', null, null, 'key', 'value', "#displayExpr_design", function (selectedvalue, hidden) {
                    if (selectedvalue.selectedRowsData.length > 0) {
                        var array = selectedvalue.selectedRowsData;
                        var keys = array.map(item => item.key).join(',');
                        var values = array.map(item => item.value).join(',');
                        $('#design_hidden').val(keys);
                        $('#displayExpr_design').val(values);
                        empr_ClosingShop.isValueAssigned = false;
                        $('#group_hidden').val('');
                        $('#displayExpr_group').val('');
                        $('#ItemGroup_grid').dxDataGrid('instance').selectRows([]);
                    }
                    else {
                        $('#design_hidden').val('');
                        $('#displayExpr_design').val('');
                    }
                }, 'multiple');
            },
            error: function (error) {
                console.error('Error fetching data:', error);
            }
        });
    },
    InitItemGroupDDL: function (_selectedValue) {
        $.ajax({
            url: 'ClosingShop/GetItemGroups',
            method: 'GET',
            success: function (data) {
                empr_ClosingShop.MultipleDxGridBoxDropdown('#ItemGroup', data, [{ dataField: 'key', caption: 'Code', width: '60px' }, { dataField: 'value', caption: 'Name' }], 'hidden', null, null, 'key', 'value', "#displayExpr_group", function (selectedvalue, hidden) {
                    if (selectedvalue.selectedRowsData.length > 0) {
                        var array = selectedvalue.selectedRowsData;
                        var keys = array.map(item => item.key).join(',');
                        var values = array.map(item => item.value).join(',');
                        $('#group_hidden').val(keys);
                        $('#displayExpr_group').val(values);
                        empr_ClosingShop.isValueAssigned = false;
                        $('#design_hidden').val('');
                        $('#displayExpr_design').val('');
                        $('#DesignNo_grid').dxDataGrid('instance').selectRows([]);
                    }
                    else {
                        $('#group_hidden').val('');
                        $('#displayExpr_group').val('');
                    }
                }, 'multiple');
            },
            error: function (error) {
                console.error('Error fetching data:', error);
            }
        });
    },
    MultipleDxGridBoxDropdown: function (divid, datasrc, col, hiddenid, selectedOjb, selectval, valueExpr, displayExpr, displayExprHidden, onchangeFun) {
        ati_dxHelper.MultipleDxGridBoxDropdown(divid, datasrc, col, hiddenid, selectedOjb, selectval, valueExpr, displayExpr, displayExprHidden, onchangeFun);
    },
}