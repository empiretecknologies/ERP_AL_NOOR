using Empire_ERP.Core.Entities;
using Empire_ERP.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Empire_ERP.Core.Services
{
    public class SalesmanTargetService : ISalesmanTargetService
    {
        public  ISalesmanTargetRepository _salesmanTargetRepository { get; set; }
        public SalesmanTargetService(ISalesmanTargetRepository salesmanTargetRepository)
        {
            _salesmanTargetRepository = salesmanTargetRepository;
        }

        public MyHttpResponseMessage QuickSearch(Common common)
        {
            return _salesmanTargetRepository.QuickSearch(common);
        }

        public MyHttpResponseMessage Save(SalesmanTarget model, Common common)
        {
            return _salesmanTargetRepository.Save(model, common);
        }

        public string GenerateNextId(Common common)
        {
            return _salesmanTargetRepository.GenerateNextId(common);
        }

        public MyHttpResponseMessage GetSetupSubTypeById(int id, Common common)
        {
            return _salesmanTargetRepository.GetSetupSubTypeById(id, common);
        }

        public MyHttpResponseMessage Delete(int id, Common common)
        {
            return _salesmanTargetRepository.Delete(id, common);
        }
    }
}