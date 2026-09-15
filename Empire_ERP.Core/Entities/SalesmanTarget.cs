using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Empire_ERP.Core.Entities
{
    public class SalesmanTarget
    {
        public int GROUP_CODE { get; set; }
        public string? GROUP_NAME { get; set; }
        public int? BCODE { get; set; }
        public DateTime? FDATE { get; set; }
        public DateTime? TDATE { get; set; }
        public Decimal? TAMT { get; set; }
        public Decimal? TPER { get; set; }
        public string? ADD_USER_ID { get; set; }
        public DateTime? ADD_DATE { get; set; }
        public string? ADD_COMPUTER_NAME { get; set; }
        public string? ADD_IP_ADDRESS { get; set; }
        public string? EDIT_USER_ID { get; set; }
        public DateTime? EDIT_DATE { get; set; }
        public string? EDIT_COMPUTER_NAME { get; set; }
        public string? EDIT_IP_ADDRESS { get; set; }
        public string? ADD_POSTALCODE { get; set; }
        public string? EDIT_POSTALCODE { get; set; }
        public string? ASTATUS { get; set; }
        public string? BRANCH { get; set; }
        public int? MENU_ID { get; set; }
        public int? EXPIRE { get; set; }
        public string? DLT { get; set; }
        public string? MENU_NAME { get; set; }

    }
}