package kr.campus.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import lombok.extern.log4j.Log4j;

@Log4j
@Controller
@RequestMapping("/shop/registItem")
public class AdminController {
   
   /*
    * @Autowired private AuthorService authorService;
    */
   
//   @Autowired
//   private AdminService adminService;
//   
//   /* 관리자 메인 페이지 이동 */
//   @RequestMapping(value="main", method = RequestMethod.GET)
//   public void adminMainGEt() throws Exception{
//      
//      logger.info("관리자 페이지 이동");
//   }
   
   /* 상품 등록 페이지 접속 */
   @RequestMapping(value="registItem", method = RequestMethod.GET)
   public void registItemGET() throws Exception{
      log.info(" 상품 등록 페이지 접속");
   }

}