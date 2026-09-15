var empr_SalesmanTarget = {
    initEvents: function () {

        $(document).ready(function () {

            empr_SalesmanTarget.InitQuickSearch();
            empr_SalesmanTarget.InItBranchDDl();

            $('#BtnSave').click(function () {
                if (Permissions != "Admin") {
                    if (!$("#Code").val() && !Permissions.r_ADD) {
                        empr_helper.notify("You are not allowed to add new record !", 2);
                    }
                    else if (($("#Code").val() > 0) && !Permissions.r_EDIT) {
                        empr_helper.notify("You are not allowed to edit records !", 2);
                    } else {
                        if (empr_SalesmanTarget.validateForm()) {
                            empr_SalesmanTarget.saveAttempt();
                        }
                    }
                } else {
                    if (empr_SalesmanTarget.validateForm()) {
                        empr_SalesmanTarget.saveAttempt();
                    }
                }
            });

            $('body').on('click', '#QuickSearch', function () {
                empr_SalesmanTarget.InitQuickSearch();
            });

            $('body').on('click', '.elm_edit', function () {
                var reportid = $(this).attr("reportid");
                empr_SalesmanTarget.GetSetupSubTypeByID(reportid);
            });

            $('body').on('click', '#BtnNew', function () {
                $('#BtnDelete').hide();
                $('#BtnNew').hide();

                empr_SalesmanTarget.resetForm();
            });

            $('#BtnDelete').click(function () {
                empr_SalesmanTarget.DeleteRecord();
            });

            if (Permissions != "Admin") {
                !Permissions.r_VIEW && $('#gridContainer').hide();
                (!Permissions.r_ADD && !Permissions.r_EDIT) && $('#BtnSave').hide();
            }
            //$('#Image').change(function () {
            //    empr_SalesmanTarget.SaveImage();
            //})
        });
    },
    DeleteRecord: function () {

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
            ajaxHelper.ajaxPostJsonData({ id: $('#Code').val() }, "/SetupSubType/Delete", function (data) {
                empr_helper.notify(data.msg, data.msgType);
                if (data.msgType == 1) {
                    empr_SalesmanTarget.resetForm();
                    empr_SalesmanTarget.InitQuickSearch();
                    $('#optmodal').modal('hide');
                    $('#BtnDelete').hide();
                    $('#BtnNew').hide();
                }
            }, false, true);
        });

    },
    resetForm: function () {
        $("#Code").val('');
        $("#BRANCH").val('');
        $("#Image").val(''); 
        $("#GROUP_NAME").val(''); 
        var today = new Date().toISOString().split('T')[0];

        // Input field mein set karne ke liye
        $("#FromDate").val(today);
        //$("#FromDate").val(''); 
        $("#ToDate").val(''); 
        $("#TAMT").val(''); 
        $("#TPER").val(''); 
        $('#EXPIRE').prop('checked', false);
        $('#BRANCH').dxSelectBox('instance').option('value', "");

        $('#ASTATUS').dxSelectBox('instance').option('value', "Y");
        if (Permissions != "Admin") {
            if (Permissions.r_ADD) {
                $('#BtnSave').show();
            } else {
                $('#BtnSave').hide();
            }
        } else {
            $('#BtnSave').show();
        }
    },
    validateForm: function () {

        var valid = true;
        var data = empr_SalesmanTarget.GetDataToSave();

        var GROUP_NAME = $("#GROUP_NAME").val().trim();

        if (data.GROUP_NAME == '') {
            valid = false;
            empr_helper.notify("Please enter Description.", 2);
        }
        if (data.FDATE == "" ) {
            empr_helper.notify("Please enter from date .", 2);
            valid = false;
        }
        if (data.TDATE == "") {
            empr_helper.notify("Please enter to date .", 2);
            valid = false;
        }
        if (data.TAMT == "") {
            empr_helper.notify("Please enter target amount .", 2);
            valid = false;
        }
        if (data.FDATE != "" && data.TDATE != "") {
            let fromDate = new Date(data.FDATE);
            let toDate = new Date(data.TDATE);

            if (toDate <= fromDate) {
                empr_helper.notify("To date must be later than from date.", 2);
                valid = false;
            }
        }

        return valid;
    },
    GetDataToSave: function () {

        var ID = $("#Code").val();
        var GROUP_NAME = $("#GROUP_NAME").val();
        //var GROUP_PIC = $("#GROUP_PIC").val();
        var ASTATUS = $("#ASTATUS").dxSelectBox('instance').option('value');     
        var BCODE = $("#BRANCH").dxSelectBox('instance').option('value');        
        var FDATE = $("#FromDate").val();
        var TDATE = $("#ToDate").val();
        var TAMT = $("#TAMT").val();
        var TPER = $("#TPER").val();
        var EXPIRE = $('#EXPIRE').is(':checked') ? 1 : 0;
        var modelRecord = {
            GROUP_CODE: ID,
            GROUP_NAME: GROUP_NAME,
            ASTATUS: ASTATUS,
            BCODE: BCODE,
            FDATE: FDATE,
            TDATE:TDATE,
            TAMT: TAMT,
            TPER: TPER,
            EXPIRE: EXPIRE
        }
        return modelRecord;
    },
    saveAttempt: function () {

        var obj = empr_SalesmanTarget.GetDataToSave();
        ajaxHelper.ajaxPostJsonData(obj, "/SalesmanTarget/save", function (data) {
            empr_helper.notify(data.msg, data.msgType);
            if (data.msgType == 1) {
                empr_SalesmanTarget.resetForm();
                empr_SalesmanTarget.InitQuickSearch();
                $('#optmodal').modal('hide');
                $('#BtnDelete').hide();
                $('#BtnNew').hide();
            }
        }, false, true);
    },
    SaveImage: function () {
        $('#BtnSave').prop('disabled', true);
        //var files = document.getElementById('Image').files;
        //var formData = new FormData();
        //for (var i = 0; i !== files.length; i++) {
        //    formData.append("model", files[i]);
        //}
        var base64String = $('#item-img-output').attr('src').replace('data:image/png;base64,', '');
        var binaryData = atob(base64String);
        var blob = new Blob([new Uint8Array(Array.prototype.map.call(binaryData, function (char) {
            return char.charCodeAt(0);
        }))], { type: 'image/png' });

        var formData = new FormData();
        formData.append('model', blob);
        $.ajax({
                url: "/SetupSubType/SaveImage",
                data: formData,
                processData: false,
                contentType: false,
                type: "POST",
                success: function (data) {
                    if (data.msgType == '1') {
                        $("#GROUP_PIC").val(data.data);
                    }
                    else {
                        console.log(data);
                        empr_helper.notify("Something went wrong while saving the file. please re-upload the file.", data.msgType);
                    }
                    $('#BtnSave').prop('disabled', false);
                }
            }
        );
    },
    InitQuickSearch: function () {
        empr_SalesmanTarget.GetAllSetupSubTypes();
    },
    GetAllSetupSubTypes: function () {
        ajaxHelper.ajaxGetJson('/SalesmanTarget/QuickSearch', function (data) {
            empr_SalesmanTarget.CreateGrid(data.data);
        }, false, true);
    },
    GetSetupSubTypeByID: function (id) {
        ajaxHelper.ajaxGetJson('/SalesmanTarget/GetSetupSubTypeByID?id=' + id, function (data) {
            empr_SalesmanTarget.resetForm();
            if (data.msgType == 1) {
                debugger;
                var record = data.data;

                $("#Code").val(record.grouP_CODE);
                $('#ASTATUS').dxSelectBox('instance').option('value', record.astatus);
                $('#BRANCH').dxSelectBox('instance').option('value', record.bcode);
                $("#GROUP_NAME").val(record.grouP_NAME);
                $("#TAMT").val(record.tamt);
                $("#TPER").val(record.tper);
              
                //$("#FromDate").val(record.fdate);
                //$("#ToDate").val(record.tdate);
                if (record.fdate) {
                    $("#FromDate").val(record.fdate.split('T')[0]);
                }
                if (record.tdate) {
                    $("#ToDate").val(record.tdate.split('T')[0]);

                    if (record.tdate) {
                        $("#ToDate").val(record.tdate.split('T')[0]);
                        const toDate = new Date(record.tdate);
                        const currentDate = new Date();

                        if (toDate <= currentDate) {
                            $("#EXPIRE").prop('checked', true);
                        } else {
                            $("#EXPIRE").prop('checked', false);
                        }
                    }
                }
                if (record.expire == 1) { 
                    $("#EXPIRE").prop('checked', record.expire == 1);
                }
                $('.modal').modal('hide');
                //$('#BtnDelete').show();
                if (Permissions != "Admin") {
                    if (Permissions.r_DLT) {
                        $('#BtnDelete').show();
                    }
                    if (Permissions.r_ADD) {
                        $('#BtnNew').show();
                    }
                    if (Permissions.r_EDIT) {
                        $('#BtnSave').show();
                    }
                    else {
                        $('#BtnSave').hide();
                    }
                } else {
                    $('#BtnSave').show();
                    $('#BtnDelete').show();
                    $('#BtnNew').show();
                }
            } else {
                empr_helper.notify(data.msg, data.msgType);
            }
        }, false, true);
    },
    CreateGrid: function (dataSrc) {

        var col = [{
            dataField: "Action",
            width: 100,
            alignment: 'center',
            fixed: true,
            fixedPosition: "left",
            allowExporting: false,
            cellTemplate: function (container, options) {
                debugger
                var html = '<div class="btn-group btn-group-sm">';
                if (options.data.gpic != null && options.data.gpic != '' && options.data.gpic != undefined) {
                    html += `<a href="javascript:;" class="grid-action-icon" title="View Pic" onclick="ShowImage('${options.data.gpic}')"><i class="fa fa-eye"></i></a>`;
                }
                html += `<a href="javascript:;" class="grid-action-icon elm_edit" style="padding-left: 6px;" reportid=${options.data.grouP_CODE} title="Edit"><i class="fa fa-edit"></i></a>`;
                html += '</div>';                
                $(html).appendTo(container);
            }
        },
           
            { dataField: 'grouP_NAME', caption: 'Description' },
            { dataField: 'branch', caption: 'Branch Name' },

            { dataField: 'fdate', caption: 'From Date', dataType: 'date', format: 'dd-MM-yyy' },
            { dataField: 'tdate', caption: 'To Date', dataType: 'date', format: 'dd-MM-yyy' },
            { dataField: 'tamt', caption: 'Target Amount' },
            { dataField: 'tper', caption: 'Target Percentage' },



            { dataField: 'adD_USER_ID', caption: 'Created By', visible: false },
            { dataField: 'adD_DATE', caption: 'Created Date', visible: false, dataType: 'date', format: 'dd-MM-yyy' },
            { dataField: 'adD_COMPUTER_NAME', caption: 'Created Computer', visible: false },
            { dataField: 'adD_IP_ADDRESS', caption: 'Created IP', visible: false },
            { dataField: 'adD_POSTALCODE', caption: 'Created PostalCode', visible: false },
            { dataField: 'ediT_USER_ID', caption: 'Updated By', visible: false },
            { dataField: 'ediT_COMPUTER_NAME', caption: 'Updated Computer', visible: false },
            { dataField: 'ediT_IP_ADDRESS', caption: 'Updated IP', visible: false },
            { dataField: 'ediT_DATE', caption: 'Updated Date', visible: false, dataType: 'date', format: 'dd-MM-yyy' },
            { dataField: 'ediT_POSTALCODE', caption: 'Updated PostalCode', visible: false },
        ];
        empr_helper.dxGridbindingVouchers('#gridContainer', col, dataSrc, "SalesManTarget","single");
    },

    InItBranchDDl: function (selectedValue) {
     
        $('#BRANCH').dxSelectBox({
            dataSource: Branch,
            displayExpr: 'value',
            valueExpr: 'key',
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
        });
    },
}