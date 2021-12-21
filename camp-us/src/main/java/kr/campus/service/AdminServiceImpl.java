package kr.campus.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.campus.domain.ItemVO;
import kr.campus.mapper.AdminMapper;
import lombok.extern.log4j.Log4j;

@Service
@Log4j
public class AdminServiceImpl implements AdminService {
   
   @Autowired
   private AdminMapper adminMapper;

   /* 상품 등록 */
   @Override
   public void itemsEnroll(ItemVO items) {
      
      log.info("(service)itemsEnroll......");
      
      adminMapper.itemsEnroll(items);
      
   }
}