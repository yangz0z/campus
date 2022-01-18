<%@ page language="java" contentType="text/html; charset=UTF-8"
   pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<!-- jstl core 쓸때 태그에 c 로 표시. -->
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt"%>
<!-- jstl fmt 쓸때 위와 같음. fmt : formatter 형식 맞춰서 표시 -->
<%@ include file="../includes/header.jsp"%>

<!DOCTYPE html>
<html lang="en">
<head>
<title>CAMP-US</title>
<meta charset="utf-8">
<meta name="viewport"
   content="width=device-width, initial-scale=1, shrink-to-fit=no">

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

</head>
<body>
   <div id="ab" style="display: none">
      <table width="1200" height="100" align="center">
         <tr>
            <td><font size="2em">상품분류</font></td>
            <td><input type="text" name="name" size="20"></td>
            <td><font size="2em">상품코드</font></td>
            <td><input type="text" name="name" size="20"></td>
            <td><font size="2em">재고</font></td>
            <td><input type="text" name="name" size="20"></td>
            <td><font size="2em">상품등록일</font></td>
            <td><input type="text" name="name" size="20"></td>
            <td><input type="submit"
               class="btn btn-sm btn-primary form-control" value="상품수정"></td>
         </tr>
      </table>
   </div>


   <div class="site-section">
      <div class="container">
         <div class="row">
            <div class="col-md-6">
               <img src="/img/${item.thumbnail}" alt="Image placeholder"  class="img-fluid"> 
            </div>
            <div class="col-md-6">
               <div class="itemname">
                  <h3><c:out value="${item.itemName}"/></h3>
               </div>
               
               <%-- <input type="hidden" value='${member.userID}'> --%>
               
               <!-- <input type="text" class="form-control py-4" placeholder="상품명"
                  style="width: 400px;">  -->
                  <!-- <select id="c_country"
                  class="form-control" style="width: 400px;">
                  <option value="1">옵션:</option>
                  <option value="2">최종혁1</option>
                  <option value="3">최종혁2</option>
                  <option value="4">최종혁3</option>
                  <option value="5">최종혁4</option>
                  <option value="6">최종혁5</option>
                  <option value="7">최종혁6</option> 
               </select>  -->
               <p>
               <a>택배배송</a>&nbsp;&nbsp;<a>|</a>&nbsp;&nbsp;<a>무료배송</a>
               <p>
               <p>
               <p>
                  <font size="3em">가격</font>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                  <font size="6em" class=" py-4"><fmt:formatNumber value="${item.price}" pattern="#,###"/></font> 
                  <font size="3em">원</font>
               <p>
                  <span>
                     <font size="3em">수량</font>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
                     <input type="text" id="quantity_input" value="1">
                     <button class="plus_btn btn">+</button>
                     <button class="minus_btn btn">-</button>
                  </span>
               <p>
                  <input type="submit" class="btn btn-sm btn-primary form-control"
                     id="wishlist" value="찜하기" style="width: 200px;"> 
                  <input type="submit" class="btn btn-sm btn-primary form-control" 
                     id="cart" value="장바구니" style="width: 200px;">
            </div>
            
            <form id="actionForm" action="/shop/readItem" method="get">
               <input type="hidden" id="itemname" value="${item.itemName}" >
               <input type="hidden" id="itemCode" value="${item.itemCode}">
               <input type="hidden" id="stock" value="${item.quantity}"> 
               <input type="hidden" id="quantity" value="">
            </form>
         </div>
      </div>
   </div>
   
   <div>
   		<img src="/img/${item.details}" alt="Image placeholder" class="img-fluid">
   </div>
    
   
<%--    
   <!-- 리뷰 -->
   <div class="site-section">
      <div class="container">
         <div class="row">
            <div class="col-md-6">
               <p>
                  <font size="5em">REVIEW</font>
               <p>
               <p>
               <p>
               <p>
               <div class="review-list">
                  <div class="box" style="background: #BDBDBD;">
                     <img class="profile" src="resources/images/profile.png">
                  </div>
               </div>
            </div>
            <sec:authorize access="isAuthenticated()">
               <button type="button" id="addReviewBtn" class="btn">리뷰작성</button>
            </sec:authorize>
         </div>
      </div>
   </div>
   
   <!-- 리뷰작성 모달 -->
   <div class="modal fade" id="reviewModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog">
         <div class="modal-content">
            <div class="modal-header">
               &times;
               <h4 class="modal-title" id="reviewModalLabel">리뷰작성</h4>
            </div>
            <div class="modal-body">
               <div class="form-group">
                  <label>상품명</label>
                  <input class="form-control" name="itemName" value="<c:out value='${item.itemName}'/>" readonly>
               </div>
               <div class="form-group">
                  <label>작성자</label>
                   <input class="form-control" name="userID" value="" readonly>
               </div>
               <div class="form-group">
                  <label>작성일</label>
                  <input class="form-control" name="reviewDate" value="" readonly>
               </div>
               <div class="form-group">
                  <label>내용</label>
                  <input class="form-control" name="content" value="새 리뷰">
               </div>
            </div>
            <div class="modal-footer">
               <button id="modalModBtn" type="button" class=btn>수정</button>
               <button id="modalRemoveBtn" type="button" class=btn>삭제</button>
               <button id="modalRegistBtn" type="button" class=btn>등록</button>
               <button id="modalCloseBtn" type="button" class=btn>닫기</button>
            </div>
         </div>
      </div>
   </div> --%>






   <script src="/resources/js/jquery-3.3.1.min.js"></script>
   <script src="/resources/js/jquery-ui.js"></script>
   <script src="/resources/js/popper.min.js"></script>
   <script src="/resources/js/bootstrap.min.js"></script>
   <script src="/resources/js/owl.carousel.min.js"></script>
   <script src="/resources/js/jquery.magnific-popup.min.js"></script>
   <script src="/resources/js/aos.js"></script>
   <script src="/resources/js/main.js"></script>
</body>

<!-- <script type="text/javascript" src="/resources/js/review.js"></script> -->

<script>
$(document).ready(function() {
   
   var codeVal = '<c:out value="${item.itemCode}"/>';
   
/*    //로그인 관련 처리
   var userID = null;
   <sec:authorize access="isAuthenticated()">
      userID = '${pinfo.userID}';
   </sec:authorize>
   
   var csrfHeaderName="${_csrf.headerName}";
   var csrfTokenValue="${_csrf.token}"; 
   
    $(document).ajaxSend(function(e,xhr,options){
      xhr.setRequestHeader(csrfHeaderName, csrfTokenValue);
   }); //csrf 값을 미리 설정해 두고, ajax처리시마다 이용
   
   
   var modal = $("#reviewModal");
   
   var modalInputReviewDate = modal.find("input[name='reviewDate']");
   var modalInputUserID = modal.find("input[name='userID']");
   var modalInputContent = modal.find("input[name='content']");
   var modalInputItemName = modal.find("input[name='itemName']");
   
   var modalModBtn = $("#modalModBtn");
   var modalRemoveBtn = $("#modalRemoveBtn");
   var modalRegistBtn = $("#modalRegistBtn");
   var modalCloseBtn = $("#modalCloseBtn");
   
   $("#addReviewBtn").on("click", function(e) {
      modal.find("input").val("");
      modalInputReviewDate.closest("div").hide();
      modal.find("button[id!='modalCloseBtn']").hide();
      modal.find("input[name='userID']").val(userID);
      modalRegistBtn.show();
      $("#reviewModal").modal("show");
   });
   
   modalCloseBtn.on("click", function(e) {
      modal.modal("hide");
   });
   
   modalRegistBtn.on("click", function(e) {
      var review = {
            userID : modalInputUserID.val(),
            content : modalInputContent.val(),
            itemName : modalInputItemName.val(),
            itemCode : codeVal
      };
      reviewService.insert(review, function(result) {
         alert(result);
         modal.find("input").val(""); //모달창 초기화
         modal.modal("hide");
      });
   });
   
   //댓글목록
   var reviewUL = $(".review-list");
   function reviewList(page) {
      reviewService.getList({
         itemCode: codeVal,
         page: page || 1
      },
      function (list) {
         var str="";
         if (list == null || list.length == 0) {
            reviewUL.html("");
            return;               
         }
         for (var i=0, len=list.length||0; i<len; i++) {
            str+= "<li class='left ";
            str+= "clearfix' data-reviewno='";
            str+= list[i].reviewNo+"'>";
            str+= "<div><div class='header' ";
            str+= "><strong class='";
            str+= "primary-font'>";
            str+= list[i].userID + "</strong>";
            str+= "<small class='float-sm-right '>";
            str+= reviewService.displayTime(list[i].reviewDate) + "</small></div>";
            str+= "<p>" + list[i].content;
            str+= "</p></div></li>";
         }
         reviewUL.html(str);
      });
   }
   
   //특정 댓글 읽기
   $(".review-list").on("click", function(e) {
      var reviewNo = $(this).data("reviewno");
      console.log(reviewNo);
      
      reviewService.read(reviewNo, function(review) {
         modalInputUserID.val(review.userID);
         modalInputContent.val(review.content);
         modalInputItemName.val(review.itemName);
         modalInputReviewDate.val(reviewService.displayTime(review.reviewDate));
         
         modal.data("reviewno", review.reviewNo);
         modal.find("button[id!='modalCloseBtn']").hide();
         
         var originalUserID = review.userID;
         if (userID == originalUserID) {
            modalModBtn.show();
            modalRemoveBtn.show();
         }
         $("#reviewModal").modal("show");
      });
   });
   
   //리뷰 수정 처리
   modalModBtn.on("click", function(e) {
      var originalUserID = modalInputUserID.val();
      
      var review = {
         reviewNo : modal.data("reviewno"),
         content : modalInputContent.val(),
         userID : originalUserID
      };
      
      if(!userID) {
         alert("로그인 후 수정 가능");
         modal.modal("hide");
         return;
      }
      
      if(userID != originalUserID){
         alert("자신이 작성한 댓글만 수정 가능");
         modal.modal("hide");
         return;
      }
         
      reviewService.update(reply, function(result) {
         alert(result);
         modal.modal("hide");
         //showList(pageNum);
      });
   });
   
   //리뷰 삭제 처리
   modalRemoveBtn.on("click", function(e) {
      var reviewNo = modal.data("reviewno");
      var originalUserID = modalInputUserID.val();
      
      if(!userID) {
         alert("로그인 후 삭제 가능");
         modal.modal("hide");
         return;
      }
      
      if(userID != originalUserID){
         alert("자신이 작성한 댓글만 삭제 가능");
         modal.modal("hide");
         return;
      }
      
      reviewService.remove(reviewNo, originalUserID, function(result) {
         alert(result);
         modal.modal("hide");
         //showList(pageNum);
      });
   });
    */
    
   var quantity = 1;
   
   $(".plus_btn").on("click", function(){
      quantity = $(this).parent("span").find("input").val();
      var stock = $("#stock").val();
      
      $(this).parent("span").find("input").val(++quantity);
      
      //재고 수량 반영
      if (stock < quantity) {
         alert("재고가 부족합니다.\n최대 주문 가능 수량 : "+stock);
         $(this).parent("span").find("input").val(stock);
      }
   });
   
   
   $(".minus_btn").on("click", function(){
      quantity = $(this).parent("span").find("input").val();
      if(quantity > 1){
         $(this).parent("span").find("input").val(--quantity);      
      }
   });
      
   var actionForm = $("#actionForm");
    
    $("#cart").on("click", function(e) {
      var itemname = $("#itemname").val();
      var quantity = $("#quantity_input").val();
      console.log(itemname + quantity);
       
      $.ajax({
         url : "/user/cart/insert",
         type : "post",
         data : {
            itemname : itemname,
            quantity : quantity
         },
         success : function() {
            alert("상품을 장바구니에 추가했습니다.");
            $("#quantity_input").val("1");
         },
         error : function() {
            alert("카트담기 실패");
         }
      })// end_ajax
   }); 
   
/*    $("#cart").on("click", function(e) {
      var params = {
            userid: "${userid}",
            itemCode: "${item.itemCode}",
            quantity: $(".quantity_input").val()
      }
      
      $.ajax({
         url: '/user/cart/insert',
         type: 'POST',
         data: params,
         success: function(result){
            alert("장바구니에 담겼습니다.")
         },
         error: function(XMLHttpRequest, textStatus, errorThorwn) {
            alert("error:"+XMLHttpRequest);
         }
      });
   }); */ 
   
   
   $("#wishlist").on("click", function(e) {
      console.log("add to wishlist");
      self.location = "/user/wishlist";
   });
}); //document ready function end




</script>
</html>

<%@ include file="../includes/footer.jsp"%>