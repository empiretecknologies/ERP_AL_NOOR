using Empire_ERP.Core.Entities;
using static Empire_ERP.Core.Entities.LoginDetail;

namespace Empire_ERP.Core.Interfaces
{
    public interface ILoginRepository
    {
        MyHttpResponseMessage CheckCredentials(string username, string password, bool isremember);
        MyHttpResponseMessage GetUserByUsername(string username);
        Info GetBackGroundAndLogo();
        MyHttpResponseMessage SaveUserOTP(OTPUser user);
        MyHttpResponseMessage UpdateUserOTPStatus(OTPUser user);
        MyHttpResponseMessage OTPVerification(OTPUser user);
        MyHttpResponseMessage SaveUserRecords(UserRecordModel userRecord);
        MyHttpResponseMessage UpdatePassword(User user);
        MyHttpResponseMessage GetUserByUserID(int userID);
        MyHttpResponseMessage GetAllDDL(Common common);
    }
}
