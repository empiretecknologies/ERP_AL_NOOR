using Azure;
using Empire_ERP.Core.Entities;
using Empire_ERP.Core.Interfaces;
using Empire_ERP.Core.Services;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Globalization;
using System.Reflection;
using System.Security.Policy;
using ZXing.QrCode.Internal;

namespace Empire_ERP.Infrastructure.Repositories
{
    public class ClosingShopRepository : IClosingShopRepository
    {
        public IMenuRepository _menuRepository { get; set; }
        public IBranchRepository _branchRepository { get; set; }
        public ICommonService _commonService { get; set; }
        public IPartyRepository _partyRepository { get; set; }
        public ClosingShopRepository(IMenuRepository menuRepository, IBranchRepository branchRepository, IPartyRepository partyRepository, ICommonService commonService)
        {
            _menuRepository = menuRepository;
            _branchRepository = branchRepository;
            _partyRepository = partyRepository;
            _commonService = commonService;
        }
        public MyHttpResponseMessage GetTarget(string sDate, Common common)
        {
            MyHttpResponseMessage response = new MyHttpResponseMessage();
            try
            {
                //var fDate = FromDate.ToString("yyyy-MM-dd");
                //var tDate = ToDate.ToString("yyyy-MM-dd");
                //var cashAct = 0;

                //string maxIdQuery = $"Select CASH_ACT from TBL_POS_MAP where BCODE = {common.Branch} And DLT = 'T' ";
                //using (SqlConnection connection = new SqlConnection(new SQLService().getconnstring()))
                //{
                //    SqlCommand command = new SqlCommand(maxIdQuery, connection);
                //    connection.Open();
                //    object result = command.ExecuteScalar();
                //    cashAct = Convert.ToInt32(result);
                //}

                if (!string.IsNullOrWhiteSpace(sDate) )
                {
                    List<object> jsonDataResult = new List<object>();
                    List<object> salesmanSalesResult = new List<object>();
                    string targetFromDate = null;
                    string targetToDate = null;
                    using (SqlConnection connection = new SqlConnection(new SQLService().getconnstring()))
                    {
                        string query = $"EXEC POS_TARGET '{sDate}',{common.Branch}";

                        SqlCommand command = new SqlCommand(query, connection);
                        connection.Open();
                        SqlDataReader reader = command.ExecuteReader();
                        while (reader.Read())
                        {
                            var fromDate = reader["FROM_DATE"] != DBNull.Value? Convert.ToDateTime(reader["FROM_DATE"]).ToString("yyyy-MM-dd"): null;
                            var toDate = reader["TO_DATE"] != DBNull.Value? Convert.ToDateTime(reader["TO_DATE"]).ToString("yyyy-MM-dd"): null;
                            if (targetFromDate == null)
                            {
                                targetFromDate = fromDate;
                                targetToDate = toDate;
                            }
                            var row = new
                            {
                                BNAME = reader["B_NAME"] != DBNull.Value ? Convert.ToString(reader["B_NAME"]) : string.Empty,
                                FROMDATE = fromDate,
                                TODATE = toDate,
                                TAMT = (reader["TARGET_AMOUNT"] != DBNull.Value && Convert.ToDouble(reader["TARGET_AMOUNT"]) != 0)? Convert.ToString(reader["TARGET_AMOUNT"]): string.Empty,
                                SAMT = (reader["SALE_AMT"] != DBNull.Value && Convert.ToDouble(reader["SALE_AMT"]) != 0)? Convert.ToString(reader["SALE_AMT"]): string.Empty,
                                PER = (reader["PERCENTAGE"] != DBNull.Value && Convert.ToDouble(reader["PERCENTAGE"]) != 0)? Convert.ToString(reader["PERCENTAGE"]): string.Empty,
                                DUEAMT = reader["DUE"] != DBNull.Value ? Convert.ToString(reader["DUE"]) : string.Empty,
                                DUEDAYS = reader["DUE_DAYS"] != DBNull.Value ? Convert.ToString(reader["DUE_DAYS"]) : string.Empty

                            };
                            jsonDataResult.Add(row);
                        }
                        reader.Close();

                        if (!string.IsNullOrWhiteSpace(targetFromDate) && !string.IsNullOrWhiteSpace(targetToDate))
                        {
                            string salesmanQuery = $@"SELECT ISNULL(PT.PARTY_NAME, 'Unassigned') AS SNAME,
                                                     X.TOTAL
                                                     FROM (
                                                         SELECT M.SALESMAN, ISNULL(SUM(M.RECV), 0) AS TOTAL
                                                         FROM TBL_POS_MASTER M
                                                         WHERE M.BCODE = {common.Branch}
                                                         AND M.DLT = 'T'
                                                         AND M.BILL_STATUS = 'P'
                                                         AND M.V_DATE BETWEEN '{targetFromDate}' AND '{targetToDate}'
                                                         GROUP BY M.SALESMAN
                                                     ) X
                                                     OUTER APPLY (
                                                         SELECT TOP 1 PARTY_NAME
                                                         FROM TBL_PARTY_TYPES
                                                         WHERE PARTY_CODE = X.SALESMAN
                                                         AND PARTY_TYPE_CODE = 9
                                                     ) PT
                                                     ORDER BY X.TOTAL DESC";
                            SqlCommand salesmanCommand = new SqlCommand(salesmanQuery, connection);
                            SqlDataReader salesmanReader = salesmanCommand.ExecuteReader();
                            while (salesmanReader.Read())
                            {
                                var salesmanRow = new
                                {
                                    SNAME = salesmanReader["SNAME"] != DBNull.Value ? Convert.ToString(salesmanReader["SNAME"]) : string.Empty,
                                    TOTAL = salesmanReader["TOTAL"] != DBNull.Value ? Convert.ToString(salesmanReader["TOTAL"]) : "0"
                                };
                                salesmanSalesResult.Add(salesmanRow);
                            }
                            salesmanReader.Close();
                        }
                    }

                    response.data = jsonDataResult;
                    response.data2 = salesmanSalesResult;
                    response.msg = "";
                    response.msgType = 1;
                }
                else
                {
                    response.data = "";
                    response.msg = "Something went wrong! please try again later.";
                    response.msgType = 2;
                }
            }
            catch (Exception ex)
            {
                string _catchMessage = ex.Message;
                if (ex.InnerException != null)
                {
                    _catchMessage += "<br/>" + ex.InnerException.Message;
                }
                response.msg = _catchMessage;
                response.msgType = 2;
            }
            return response;
        }

        public MyHttpResponseMessage GetClosingData(DateTime FromDate, DateTime ToDate, Common common)
        {
            MyHttpResponseMessage response = new MyHttpResponseMessage();
            try
            {
                var fDate = FromDate.ToString("yyyy-MM-dd");
                var tDate = ToDate.ToString("yyyy-MM-dd");
                var cashAct = 0;

                string maxIdQuery = $"Select CASH_ACT from TBL_POS_MAP where BCODE = {common.Branch} And DLT = 'T' ";
                using (SqlConnection connection = new SqlConnection(new SQLService().getconnstring()))
                {
                    SqlCommand command = new SqlCommand(maxIdQuery, connection);
                    connection.Open();
                    object result = command.ExecuteScalar();
                    cashAct = Convert.ToInt32(result);
                }

                if (!string.IsNullOrWhiteSpace(fDate) && !String.IsNullOrWhiteSpace(tDate))
                {
                    List<object> jsonDataResult = new List<object>();
                    using (SqlConnection connection = new SqlConnection(new SQLService().getconnstring()))
                    {
                        string query = $"exec POS_CLOSED '{fDate}', '{tDate}' ,{common.Branch},{common.Period},'{common.Username}','{cashAct}'";

                        SqlCommand command = new SqlCommand(query, connection);
                        connection.Open();
                        SqlDataReader reader = command.ExecuteReader();
                        while (reader.Read())
                        {
                            var row = new
                            {
                                ACT_NAME = Convert.ToString(reader["ACT_NAME"]),
                                POSTYPE = Convert.ToString(reader["POS_TYPE"]),
                                BALANCED = Convert.ToDouble(reader["BALANCE"]) == 0 ? "" : reader["BALANCE"],
                                QTY = Convert.ToDouble(reader["QTY"]) == 0 ? "" : reader["QTY"],
                                RATE = Convert.ToDouble(reader["RATE"]) == 0 ? "" : reader["RATE"],
                                DISC = Convert.ToDouble(reader["DISC"]) == 0 ? "" : reader["DISC"],
                                VCTYPE = Convert.ToString(reader["VC_TYPE"]),

                            };
                            jsonDataResult.Add(row);
                        }
                        reader.Close();
                    }

                    response.data = jsonDataResult;
                    response.msg = "";
                    response.msgType = 1;
                }
                else
                {
                    response.data = "";
                    response.msg = "Something went wrong! please try again later.";
                    response.msgType = 2;
                }
            }
            catch (Exception ex)
            {
                string _catchMessage = ex.Message;
                if (ex.InnerException != null)
                {
                    _catchMessage += "<br/>" + ex.InnerException.Message;
                }
                response.msg = _catchMessage;
                response.msgType = 2;
            }
            return response;
        }
        public MyHttpResponseMessage GetSyncData(Common common)
        {
            MyHttpResponseMessage response = new MyHttpResponseMessage();
            try
            {
                var Menu = _menuRepository.GetMenu(common.MenuID);
                string? table = string.Empty;
                if (Menu.data != null)
                {
                    var menu = (Menu)Menu.data;
                    table = "TBL_POS_MAP";
                }

                if (!String.IsNullOrWhiteSpace(table))
                {
                    using (SqlConnection connection = new SqlConnection(new SQLService().getconnstring()))
                    {
                        string query = "EXEC [dbo].[SP_SYNC_POS_TO_ONLINE]";
                        SqlCommand command = new SqlCommand(query, connection);
                        command.CommandTimeout = 90;
                        connection.Open();
                        command.ExecuteNonQuery();
                    }

                    response.data = "";
                    response.msg = "Data Sync Successfully";
                    response.msgType = 1;
                }
                else
                {
                    response.data = "";
                    response.msg = "Something went wrong! please try again later.";
                    response.msgType = 2;
                }
            }
            catch (Exception ex)
            {
                string _catchMessage = ex.Message;
                if (ex.InnerException != null)
                {
                    _catchMessage += "<br/>" + ex.InnerException.Message;
                }
                response.msg = _catchMessage;
                response.msgType = 2;
            }
            return response;
        }

        public MyHttpResponseMessage UpdateClosedData(DateTime FromDate, DateTime ToDate, Common common)
        {
            MyHttpResponseMessage response = new MyHttpResponseMessage();
            try
            {
                var fDate = FromDate.ToString("yyyy-MM-dd");
                var tDate = ToDate.ToString("yyyy-MM-dd");

                if (!string.IsNullOrWhiteSpace(fDate) && !String.IsNullOrWhiteSpace(tDate))
                {
                    using (SqlConnection connection = new SqlConnection(new SQLService().getconnstring()))
                    {
                        string query = $@"UPDATE TBL_POS_MASTER
                                        SET CLOSING = 1
                                        WHERE BILL_STATUS = 'P'
                                          AND (
                                                (COMPLETE = 0 AND V_DATE BETWEEN '{fDate}' AND '{tDate}')
                                                OR (COMPLETE = 1 AND DEL_DATE BETWEEN '{fDate}' AND '{tDate}')
                                              )
                                          AND BCODE = {common.Branch}
                                          AND PERIOD_ID = {common.Period}
                                          AND CLOSING = 0 ";
                        if (common.RoleType != "A")
                        {
                            query += $@"AND EDIT_USER_ID = '{common.Username}' ";
                        }
                        query += $@" UPDATE TBL_POS_EXP SET CLOSING = 1 where V_DATE between '{fDate}' and '{tDate}' AND BCODE = {common.Branch} AND PERIOD_ID = {common.Period} AND CLOSING = 0 ";
                        if (common.RoleType != "A")
                        {
                            query += $@"AND EDIT_USER_ID = '{common.Username}' ";
                        }

                        SqlCommand command = new SqlCommand(query, connection);
                        connection.Open();
                        command.ExecuteReader();
                    }
                    response.msg = "";
                    response.msgType = 1;
                }
                else
                {
                    response.data = "";
                    response.msg = "Something went wrong! please try again later.";
                    response.msgType = 2;
                }
            }
            catch (Exception ex)
            {
                string _catchMessage = ex.Message;
                if (ex.InnerException != null)
                {
                    _catchMessage += "<br/>" + ex.InnerException.Message;
                }
                response.msg = _catchMessage;
                response.msgType = 2;
            }
            return response;
        }
        public MyHttpResponseMessage GetDataForReport(ClosingShop modelRecord, CustomMenuDetail menuDetails, Info currentLabel, Branch currentBranch, Company currentCompany, Common common)
        {
            MyHttpResponseMessage response = new MyHttpResponseMessage();
            POSTransactionReport masterData = new POSTransactionReport();
            CustomPOSTransactionForPrintReport reportData = new CustomPOSTransactionForPrintReport();
            try
            {
                var Menu = _menuRepository.GetMenu(common.MenuID);
                var menu = (Menu)Menu.data;
                string connectionString = new SQLService().getconnstring();
                var totalBalance = modelRecord.Detail.Sum(i => i.balanced);
                DateTime? recordDate = null;
                TimeSpan? recordTime = null;
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();

                    SqlTransaction transaction = connection.BeginTransaction();

                    try
                    {
                        string query = $@"
                                SELECT TOP (1) RECORD_DATE, RECORD_TIME
                                FROM TBL_LOGIN_RECORDS
                                WHERE USERNAME = '{common.Username}'
                                  AND BCODE = '{common.Branch}'
                                  AND PERIOD_ID = '{common.Period}'
                                  AND STATUS = 'Login'
                                ORDER BY ID DESC";

                        SqlCommand command = new SqlCommand(query, connection, transaction);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                recordDate = Convert.ToDateTime(reader["RECORD_DATE"]);
                                recordTime = (TimeSpan)reader["RECORD_TIME"];
                            }
                        }
                        transaction.Commit();
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }

                var viewModel = new ClosingViewModal
                {
                    Clogo = currentCompany.C_LOGO,
                    BName = currentBranch.B_NAME,
                    BAddress = currentBranch.B_ADDRESS,
                    HeadingName = menuDetails.MD_NAME,
                    BPhone = currentBranch.B_TEL,
                    BNTN = currentBranch.B_NTN,
                    FName = currentLabel.C_NAME,
                    FTEL = currentLabel.TEL,
                    FWebsite = currentLabel.WEBSITE,
                    SalesmanName = common.Username,
                    TotalValue = totalBalance,
                    FromDate = modelRecord.Master.FromDate,
                    ToDate = modelRecord.Master.ToDate,
                    ClosingBalance = Convert.ToString(modelRecord.Master?.ClosingBalance).ToString() ?? "0.00",
                    loginDatetime = recordDate.Value.Date.Add(recordTime.Value),


                    Items = modelRecord.Detail.Select(i => new ClosingItemViewModel
                    {
                        Description = i.acT_NAME,
                        Rate = i.Rate,
                        Qty = i.qty,
                        Disc = i.disc,
                        Balance = i.balanced ?? 0,
                        posType = i.postype
                    }).ToList()


                };
                var groupedItems = viewModel.Items
                                .GroupBy(i => i.posType)
                                .Select(g => new ClosingItemGroupedViewModel
                                {
                                    PosType = g.Key,
                                    TotalBalance = g.Sum(i => i.Balance),
                                    Qty = g.Sum(i => i.Qty),
                                    Items = g.ToList()
                                })
                                .ToList();

                viewModel.GroupedItems = groupedItems;
                response.viewModel = viewModel;
                response.data = menuDetails;
                //response.voucherNo = voucherNo;
                response.msg = "";
                response.msgType = 1;
            }
            catch (Exception ex)
            {
                string _catchMessage = ex.Message;
                if (ex.InnerException != null)
                {
                    _catchMessage += "<br/>" + ex.InnerException.Message;
                }
                response.msg = _catchMessage;
                response.msgType = 2;
            }
            return response;
        }


        public MyHttpResponseMessage SaveClosingData(SaveClosingRequest saveClosingRequest, Common common)
        {
            MyHttpResponseMessage response = new MyHttpResponseMessage();

            try
            {
                var menuResult = _menuRepository.GetMenu(common.MenuID);
                string table = string.Empty;

                if (menuResult.data != null)
                {
                    var menu = (Menu)menuResult.data;
                    table = menu.TABLE1;
                }
                var ip = common.IPAddress;
                var computer = common.ComputerName;
                var postal = common.PostalCode;
                var userid = common.Username;

                string connectionString = new SQLService().getconnstring();

                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    SqlTransaction transaction = connection.BeginTransaction();
                    SqlCommand command = connection.CreateCommand();
                    command.Transaction = transaction;

                    try
                    {
                        DateTime toDate = DateTime.ParseExact(saveClosingRequest.Master.ToDate, "dd-MM-yyyy", CultureInfo.InvariantCulture);
                        DateTime fromDate = DateTime.ParseExact(saveClosingRequest.Master.FromDate, "dd-MM-yyyy", CultureInfo.InvariantCulture);

                        int groupCode = GetNextGroupCode(table);

                        foreach (var item in saveClosingRequest.Detail)
                        {
                            //        string insertQuery = $@"
                            //INSERT INTO {table} 
                            //    ([GROUP_CODE], [ACT_NAME], [QTY], [RATE], [DISC], [BALANCE], [POS_TYPE],
                            //     [VC_TYPE], [ADD_USER_ID], [ADD_DATE], [ADD_COMPUTER_NAME], [ADD_IP_ADDRESS],
                            //     [EDIT_USER_ID], [EDIT_DATE], [EDIT_COMPUTER_NAME], [EDIT_IP_ADDRESS],
                            //     [ADD_POSTALCODE], [EDIT_POSTALCODE], [MENU_ID], [DLT], [BCODE],
                            //     [PERIOD_ID], [FROM_DATE], [TO_DATE])
                            //VALUES
                            //    ('{groupCode}', '{item.acT_NAME}', '{(string.IsNullOrEmpty(item.qty) ? 0 : Convert.ToDouble(item.qty))}', 
                            //     '{(string.IsNullOrEmpty(item.rate) ? 0 : Convert.ToDouble(item.rate))}', '0', '{item.balanced}', '{item.postype}',
                            //     'VC', '{userid}', '{CommonService.GetDateTime("Pakistan Standard Time")}', '{computer}', '{ip}',
                            //     '{userid}', '{CommonService.GetDateTime("Pakistan Standard Time")}', '{computer}', '{ip}',
                            //     '{postal}', '{postal}', '{common.MenuID}', 'T', '{common.Branch}',
                            //     '{common.Period}', '{fromDate}', '{toDate}')";
                            string query = $"INSERT INTO {table}" +
                                                " (GROUP_CODE, ACT_NAME, QTY, RATE, DISC, BALANCE, POS_TYPE," +
                                                " VC_TYPE, ADD_USER_ID, ADD_DATE, ADD_COMPUTER_NAME, ADD_IP_ADDRESS," +
                                                " EDIT_USER_ID, EDIT_DATE, EDIT_COMPUTER_NAME, EDIT_IP_ADDRESS," +
                                                " ADD_POSTALCODE, EDIT_POSTALCODE, MENU_ID, DLT, BCODE," +
                                                " PERIOD_ID, FROM_DATE, TO_DATE)" +
                                                " VALUES" +
                                                " ('" + groupCode + "', '" + item.acT_NAME + "', '" + (string.IsNullOrEmpty(item.qty) ? 0 : Convert.ToDouble(item.qty)) + "'," +
                                                " '" + (string.IsNullOrEmpty(item.rate) ? 0 : Convert.ToDouble(item.rate)) + "', '0', '" + item.balanced + "', '" + item.postype + "'," +
                                                " 'VC', '" + userid + "', '" + CommonService.GetDateTime("Pakistan Standard Time") + "', '" + computer + "', '" + ip + "'," +
                                                " '" + userid + "', '" + CommonService.GetDateTime("Pakistan Standard Time") + "', '" + computer + "', '" + ip + "'," +
                                                " '" + postal + "', '" + postal + "', '" + common.MenuID + "', 'T', '" + common.Branch + "'," +
                                                " '" + common.Period + "', '" + fromDate + "', '" + toDate + "')";


                            command.CommandText = query;
                            command.ExecuteNonQuery();

                            groupCode++; 
                        }

                        transaction.Commit();
                        response.msgType = 1;
                        response.msg = "Record(s) added successfully.";
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        response.msg = ex.Message + (ex.InnerException != null ? "<br/>" + ex.InnerException.Message : "");
                        response.msgType = 2;
                    }
                }
            }
            catch (Exception ex)
            {
                response.msg = ex.Message + (ex.InnerException != null ? "<br/>" + ex.InnerException.Message : "");
                response.msgType = 2;
            }

            return response;
        }

        public int GetNextGroupCode(string tableName)
        {
            try
            {
                string maxIdQuery = $"SELECT ISNULL(MAX(GROUP_CODE), 0) + 1 FROM {tableName}";
                using (SqlConnection connection = new SqlConnection(new SQLService().getconnstring()))
                {
                    SqlCommand command = new SqlCommand(maxIdQuery, connection);
                    connection.Open();
                    object result = command.ExecuteScalar();
                    return Convert.ToInt32(result);
                }
            }
            catch
            {
                return 1; // fallback to 1
            }
        }

    }
}