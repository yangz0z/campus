package kr.campus.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import kr.campus.domain.CertificationVO;
import kr.campus.domain.MemberVO;
import kr.campus.service.CertificationService;
import kr.campus.service.MemberService;
import kr.campus.util.RandomStringUtils;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j;

@Log4j
@Controller
@RequestMapping("/member/*")
@AllArgsConstructor
public class MemberController {
   /*
    * private MemberService service;
    * 
    * @GetMapping("login") public void login() {
    * 
    * }
    * 
    * @GetMapping("resetPassword") public void resetPassword() {
    * 
    * }
    */

   @Autowired
   private MemberService memberservice;
   @Autowired
   private CertificationService service;
   
   @RequestMapping(value = "/login", method = RequestMethod.GET)
   public void loginPageGET() {

   }
   
   
   // 쉶 썝媛  엯 李  吏꾩엯
   @RequestMapping(value = "/join", method = RequestMethod.GET)
   public void joinPageGET() {
      
   }
   
   @GetMapping("profile")
   public void profile(Authentication authentication,Model model)
   {
      String userid = "";

      try {
         UserDetails userDetails = (UserDetails) authentication.getPrincipal();
         userid = userDetails.getUsername();// 시큐리티에서는 username이 id 
      } catch (Exception e) {
         model.addAttribute("error", "error");
      } finally {
         if (userid != null) {
            
            model.addAttribute("member", memberservice.read(userid));
         }
         else {
            model.addAttribute("error", "error");
         }
      }
   }
   
    
   
   
   @PostMapping("profile")
   public ResponseEntity<String> profile(MemberVO member)
   {
      //memberUpdate
      try {
         memberservice.memberUpdate(member);
      } catch (Exception e) {
         return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      return new ResponseEntity<String>("succuess", HttpStatus.OK);
   }
   
   // 쉶 썝媛  엯 李쎌뿉 꽌 媛   엯 젰 썑 吏꾪뻾 post
   @RequestMapping(value="/join", method = RequestMethod.POST)
   public ResponseEntity<String> joinPost(MemberVO member) {
      
      
      
      try {
         memberservice.memberJoin(member);
      } catch (Exception e) {
         return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      return new ResponseEntity<String>("succuess", HttpStatus.OK);
      
      
   }
   ///  븘 씠 뵒 以묐났 솗 씤
      @PostMapping("/idCheck")
      public ResponseEntity<String> idCheck(MemberVO member, Model model) {
         MemberVO vo = memberservice.idcheck(member);
         if (vo != null) {
            return new ResponseEntity<String>("no", HttpStatus.OK);
         } else
            return new ResponseEntity<String>("yes", HttpStatus.OK);
      }
      
      
      @GetMapping("/certification")
      public void certification() 
      {
         
      }
      
      // CertificationVO  userid requst 
      // 난수를 발생 시켜서 DB에 넣음
      @PostMapping("/add")
      public ResponseEntity<String> add(CertificationVO vo,Model model) {
         // 대문자 소문자 구별을 해서(숫자도 포함) 6자리를 만들겠다는 뜻
         String retval = RandomStringUtils.randomAlphanumeric(6);
         log.info("userid:"+vo.getUserId());
         //CertificationVO vo = new CertificationVO();
         vo.setKey(retval);      
         service.add(vo);// insert 
         
         
         MemberVO member=   memberservice.read(vo.getUserId());
         log.info("userid:"+member.getUserId());
         //log.info("email:"+member.getEmail());
         //model.addAttribute("email", member.getEmail());
               
         //member Table  update 
         return new ResponseEntity<String>(retval+","+member.getEmail(), HttpStatus.OK);
      }
      // 인증하는 코드
      // 인증하고나서 바로 DB에서 삭제함
       @PostMapping("/get")
          public  ResponseEntity<String> get(CertificationVO vo)
          {
          log.info("key:"+vo.getKey());
          log.info("userid::"+vo.getUserId());
           CertificationVO data = service.get(vo);
           log.info("data:"+data);
             if(data!= null)
             {
                service.delete(vo);
                
                MemberVO member=   memberservice.read(vo.getUserId());
                
                member.setPassword(vo.getKey());
                memberservice.memberUpdate(member);
                
                return new ResponseEntity<String>("succuess", HttpStatus.OK);
             }
             else
            {
               return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);   
            }
             
          }

   
}