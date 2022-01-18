<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<!-- jstl core 쓸때 태그에 c 로 표시. -->
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt"%>
<!-- jstl fmt 쓸때 위와 같음. fmt : formatter 형식 맞춰서 표시 -->

<!-- my page 전체 수정 예정 기존 home.jsp 에 드롭박스로 추가 예정-->


<link rel="stylesheet"
	href="https://fonts.googleapis.com/css?family=Mukta:300,400,700">
<link rel="stylesheet" href="/resources/fonts/icomoon/style.css">
<link rel="stylesheet" href="/resources/css/bootstrap.min.css">
<link rel="stylesheet" href="/resources/css/magnific-popup.css">
<link rel="stylesheet" href="/resources/css/jquery-ui.css">
<link rel="stylesheet" href="/resources/css/owl.carousel.min.css">
<link rel="stylesheet" href="/resources/css/owl.theme.default.min.css">
<link rel="stylesheet" href="/resources/css/aos.css">
<link rel="stylesheet" href="/resources/css/style.css">
<script src="/resources/js/jquery-3.3.1.min.js"></script>
<script src="/resources/js/jquery-ui.js"></script>
<script src="/resources/js/popper.min.js"></script>
<script src="/resources/js/bootstrap.min.js"></script>
<script src="/resources/js/owl.carousel.min.js"></script>
<script src="/resources/js/jquery.magnific-popup.min.js"></script>
<input type="hidden" id="hidretval" name="hidretval">
<!-- 3분 초과 여부 판단 n 3분 안됨 , y 3분 초과  -->
<input type="hidden" id="timerYN" name="timerYN" value="n">
<input type="hidden" id="auth" name="auth" value="n">



<div class="site-section block-8">
	<div class="container">
		<div class="row justify-content-center  mb-5">
		   
			<div class="col-md-7 site-section-heading text-center pt-4">
			   
				<h2>아이디 인증</h2>
				<input type="text" id="userId" name="userId"
					class="form-control py-4" placeholder="아이디">
					<button id="reIdCheck" class="btn btn-sm btn-primary form-control">인증</button>
				<br> <br> <input type="text" id="reId" name="reId"
					class="form-control py-4" placeholder="전송된 이메일을 복사후 텍스트에 넣으신뒤 enter를 눌러주세요.">
				
				
				<div class="col-2">
						<span id="spantimer" style="color: black;"><small id="smalltimer"></small></span>
					</div>
				
				<a type="submit"
							class="btn btn-sm btn-primary form-control" href="/"
							value="홈으로 이동">홈으로 이동</a>
                <input type="hidden" id="emailcheck" name="emailcheck" value="n">
			</div>
		</div>
	</div>
</div>


<script
	src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
<script>
	var csrfHeaderName = "${_csrf.headerName}";
	var csrfTokenValue = "${_csrf.token}";
	
	
	
	/* 메일 발송 .. 
	 param : key 암호화 키 
	 type은 이메일 컨트롤 참조
	 */
	 function EmailSend(key,email)
	 {		
		 var params = {
					subject : 'camp-us 회원가입 인증'	,
					content : key				,
					from    : 'whdvkf20001@naver.com'	, // 관리자 
					to      : email		, // 사용자 
					type    : 'findpwd'
					
				}
				
				$.ajax({
					type : "POST", // HTTP method type(GET, POST) 형식이다.
					url : "/email/send", // 컨트롤러에서 대기중인 URL 주소이다.
					beforeSend : function(xhr) {
						xhr.setRequestHeader(csrfHeaderName, csrfTokenValue);
					},
					data : params, // Json 형식의 데이터이다.
					success : function(res) { // 비동기통신의 성공일경우 success콜백으로 들어옵니다. 'res'는 응답받은 데이터이다.
						alert("메일으로 발송 되었습니다.메일을 확인하여 주세요");

					},
					error : function(XMLHttpRequest, textStatus, errorThrown) { // 비동기 통신이 실패할경우 error 콜백으로 들어옵니다.
						alert("이메일 발송 실패")
					}
				});
	 }
	
	
	// 실시간으로 남은 시간 보여 주는 함수 
	 /*
	 	 dt :datetime ,
	 	 id : control ID
	 	 
	 */
	 var timer;
	 function CountDownTimer(dt, id) {
	     var end = new Date(dt);
	     var _second = 1000;
	     var _minute = _second * 60;
	     var _hour = _minute * 60;
	     var _day = _hour * 24;
	    // var timer;
	     function showRemaining() {
	         var now = new Date();
	         var distance = end - now;
	         if (distance < 0) {
	             clearInterval(timer);
	             $("#timerYN").val("y");
	             document.getElementById(id).innerHTML = '다시 인증을 하여 주세요.';
	             return;
	         }
	         var days = Math.floor(distance / _day);
	         var hours = Math.floor((distance % _day) / _hour);
	         var minutes = Math.floor((distance % _hour) / _minute);
	         var seconds = Math.floor((distance % _minute) / _second);
	         document.getElementById(id).innerHTML = "";
	         //document.getElementById(id).innerHTML += days + '날자 ';
	         //document.getElementById(id).innerHTML += hours + '시간 ';
	         document.getElementById(id).innerHTML += minutes + '분' ;
	         document.getElementById(id).innerHTML += seconds + '초'+' 남음'; 
	     }
	     timer = setInterval(showRemaining, 1000); // 1초마다 showRemaining 함수 계속 호출 
	 }
	
$(document).ready(function(){
	
	$(document).on("click","#reIdCheck",function(){
		if($("#userId").val() =="")
			{
			alert("아이디를 입력하여 주세요.")
			return;
			}
//alert("")
//ajax 
var now = new Date();
		var mm = Number(now.getMonth()+1);
		
		if(mm<10)
		{
			mm = '0'+mm;
		}
		//alert(mm)
		var dd = now.getDate();
		if(dd<10)
		{
			dd ='0'+dd;
		}
		var yy =now.getFullYear();
		var hh = now.getHours();
		
		var m = now.getMinutes(); // /분
		if(m>=55)
		{
			m = 60-Number(m) +5;
			now.setHours(1); 
		}
		else
		{
			m=m +5;
		}
		var sec= now.getSeconds();
		var date = mm +'/'+dd+'/'+yy+' ' +hh +':'+m+":"+sec
		var day = yy+"-"+mm+"-"+dd+" "+hh+":"+m+":"+sec
		//alert(date);
		//ajax 
 		 var params = {
 				userId : $("#userId").val()
                                       }
                                 $
                                       .ajax({
                                          type : 'POST',
                                          url : '/member/add',
                                          data : params,
                                          beforeSend : function(
                                                xhr) {
                                             xhr
                                                   .setRequestHeader(
                                                         csrfHeaderName,
                                                         csrfTokenValue);
                                          },
                                          success : function(res) {
                                        	  //alert(res)
                                        	  var d1 = res.split(",")[0]
                                        	  var d2 = res.split(",")[1]
											  //return;
                                        	  EmailSend(d1,d2);
                                        	  $("#timerYN").val("n"); // 3분 초기화 
                                        	  $("#hidretval").val(d1);
                                        	 
                                        	 
                                        	  CountDownTimer(date, 'smalltimer')
                                          },
                                          error : function(
                                                XMLHttpRequest,
                                                textStatus,
                                                errorThrown) {
                                             alert("암호화 실패")
                                          }
                                       });
//ajax 
	});
	
	/*
	 change , keyup,keydown , keypress
	 .keydown() - 키 입력 시 발생되는 이벤트

	 .keypress() - keydown과 같이 키 입력 시 발생되는 이벤트지만 Enter, Tab 등의 특수키에는 발생하지 않음

	 .keyup() - 키 입력 후 발생되는 이벤트
	*/
	$(document).on("keyup","#reId",function(){
		
		var key= $(this).val();
		//alert(key)
		 var params = {
				 userId : $("#userId").val() ,
                 key : key
              }
         $
               .ajax({
                  type : 'POST',
                  url : '/member/get',
                  data : params,
                  beforeSend : function(
                        xhr) {
                     xhr
                           .setRequestHeader(
                                 csrfHeaderName,
                                 csrfTokenValue);
                  },
                  success : function(res) {
                	clearInterval(timer); // 타이머 중지 
                	$("#smalltimer").text("인증 성공");
                	// 암호화키을 패스워드 변경해주고 로그인이동 
                	$("#timerYN").val("n");// 3qns 
                	$("#auth").val("yes"); // 인증 여부 
                    alert("비밀번호가 변경되었습니다.")
                	window.location.href="/member/login"
                	// 
                	
                  },
                  error : function(
                        XMLHttpRequest,
                        textStatus,
                        errorThrown) {
                  //   alert("인증 실패")
                  }
               });
	})
});
</script>