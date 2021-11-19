<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt"%>

<%@ include file="../includes/header.jsp"%>

<div class="row">
	<div class="col-lg-12">
		<h1 class="page-header">글 읽기</h1>
	</div>
</div>

<div class="row">
	<div class="col-lg-12">
		<div class="panel panel-default">
			<div class="panel-heading">글읽기</div>
			<div class="panel-body"></div>
			
			<div class="form-group">
				<label>게시물 번호</label> <input class="form-control" name="bno" value='<c:out value="${board.bno }"/>' readonly="readonly">
			</div>
			<div class="form-group">
				<label>제목</label> <input class="form-control" name="title" value='<c:out value="${board.title }"/>' readonly="readonly">
			</div>
			<div class="form-group">
				<label>내용</label>
				<textarea class="form-control" row="3" name="content" readonly="readonly"><c:out value="${board.content }"/></textarea>
			</div>
			<div class="form-group">
				<label>작성자</label> <input class="form-control" name="writer" value='<c:out value="${board.writer }"/>' readonly="readonly">
			</div>
			
			<sec:authentication property="principal" var="pinfo"/>
			<sec:authorize access="isAuthenticated()">
				<c:if test="${pinfo.username eq board.writer}">
					<button data-oper='modify' class="btn btn-warning" id="boardModBtn">수정</button>
				</c:if>
			</sec:authorize>
				
			<button data-oper='list' class="btn btn-info" id="boardListBtn">목록</button>
			
			<form id="operForm" action="/board/modify" method="get">
				<input type="hidden" id="bno" name="bno" value="${board.bno }"/>
				<input type="hidden" name="pageNum" value="${cri.pageNum }"/>
				<input type="hidden" name="amount" value="${cri.amount }"/>
				<input type="hidden" name="type" value="${cri.type }"/>
				<input type="hidden" name="keyword" value="${cri.keyword }"/>
			</form>

		</div>
	</div>
</div>

<br/>
<div class="row">
	<div class="col-lg-12">
		<div class="panel panel-default">
			<div class="panel-heading">첨부파일</div>
			<div class="panel-body">
				<div class="uploadResult">
					<ul></ul>
				</div>
			</div>
		</div>
	</div>
</div>

<br/>
<div class="row">
	<div class="col-lg-12">
		<div class="panel panel-default">
			<div class="panel-heading">
				<i class="fa fa-comments fa-fw"></i>댓글
				<sec:authorize access="isAuthenticated()">
					<button id="addReplyBtn" class="btn btn-primary btn-xs float-right">새 댓글</button>
				</sec:authorize>		
			</div>
			<br/>
			<div class="panel-body">
				<ul class="chat">
					<li>댓글 예시</li>
				</ul>
			</div>
			<div class="panel-footer"></div>
		</div>
	</div>
</div>

<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				&times;
				<h4 class="modal-title" id="myModalLabel">댓글창</h4>
			</div>
			<div class="modal-body">
				<div class="form-group">
					<label>댓글</label> <input class="form-control" name="reply" value="새 댓글">
				</div>
				<div class="form-group">
					<label>작성자</label> <input class="form-control" name="replyer" value="writer">
				</div>
				<div class="form-group">
					<label>댓글 작성일</label> <input class="form-control" name="replyDate" value="">
				</div>
			</div>
			<div class="modal-footer">
				<button id="modalModBtn" type="button" class="btn btnwarning">수정</button>
				<button id="modalRemoveBtn" type="button" class="btn btndanger">삭제</button>
				<button id="modalRegisterBtn" type="button" class="btn btnprimary">등록</button>
				<button id="modalCloseBtn" type="button" class="btn btndefault">닫기</button>
			</div>
		</div>
	</div>
</div>
	
	

<script type="text/javascript" src="/resources/js/reply.js"></script>
<script>
	$(document).ready(function () {
		var bnoValue = '<c:out value="${board.bno}"/>';
		
		var replyer = null;
		<sec:authorize access="isAuthenticated()">
			replyer='${pinfo.username}';
		</sec:authorize>
		
		var csrfHeaderName = "${_csrf.headerName}";
		var csrfTokenValue = "${_csrf.token}";
		
		$(document).ajaxSend(function(e,xhr,options){
			xhr.setRequestHeader(csrfHeaderName, csrfTokenValue);
		});
		
		var modal = $("#myModal");
		var modalInputReplyDate = modal.find("input[name='replyDate']");
		var modalInputReply = modal.find("input[name='reply']");
		var modalInputReplyer = modal.find("input[name='replyer']");
		
		$("#addReplyBtn").on("click", function(e) {
			modal.find("input").val("");
			modalInputReplyDate.closest("div").hide();
			modal.find("button[id != 'modalCloseBtn']").hide();
			modal.find("input[name='replyer']").val(replyer);
			modal.find("input[name='replyer']").attr("readonly", "readonly");
			$("#modalRegisterBtn").show();
			$("#myModal").modal("show");
		});
		
		$("#modalCloseBtn").on("click", function(e) {
			modal.modal("hide");
		});
		
		$("#modalRegisterBtn").on("click", function(e) {
			var reply = {
					reply: modalInputReply.val(),
					replyer: modalInputReplyer.val(),
					bno: bnoValue
			};
			replyService.add(reply, function(result) {
				alert(result);
				modal.find("input").val("");
				modal.modal("hide");
				
				showList(-1);
			});
		});
		
		/* replyService.getList({
			bno: bnoValue,
			page: 1
		}, function(list){
			for (var i=0, len = list.length || 0; i < len; i++) {
				console.log(list[i]);
			}		
		}); */
		
		var replyUL = $(".chat");
		
		function showList(page) {
			replyService.getList({
				bno: bnoValue,
				page: page || 1
			},
			function (replyTotalCnt, list) {
				console.log("replyCnt: " + replyTotalCnt);
				if (page == -1) {
					pageNum = Math.ceil(replyTotalCnt / 10.0);
					showList(pageNum);
					return;
				}
				var str="";
				if (list == null || list.length == 0) {
					replyUL.html("");
					return;					
				}
				for (var i=0, len=list.length||0; i<len; i++) {
					str+= "<li class='left ";
					str+= "clearfix' data-rno='";
					str+= list[i].rno+"'>";
					str+= "<div><div class='header' ";
					str+= "><strong class='";
					str+= "primary-font'>";
					str+= list[i].replyer + "</strong>";
					str+= "<small class='float-sm-right '>";
					str+= replyService.displayTime(list[i].replyDate)
							+ "</small></div>";
					str+= "<p>" + list[i].reply;
					str+= "</p></div></li>";
				}
				replyUL.html(str);
				showReplyPage(replyTotalCnt);
			});
		}
		showList(-1);
		
		var pageNum = 1;
		var replyPageFooter = $(".panel-footer");
		
		function showReplyPage(replyCnt) {
			var endNum = Math.ceil(pageNum/10.0) * 10;
			var startNum = endNum - 9;
			var prev = startNum != 1;
			var next = false;
			
			if (endNum * 10 >= replyCnt) {
				endNum = Math.ceil(replyCnt / 10.0);
			}
			
			if (endNum * 10 < replyCnt) {
				next = true;
			}
			
			var str = "<ul class='pagination";
			str+= " justify-content-center'>";
			
			if (prev) {
				str += "<li class='page-item'><a ";
				str += "class='page-link' href='";
				str += (startNum -1);
				str += "'>이전</a></li>";
			}
			for (var i = startNum; i <= endNum; i++) {
				var active = pageNum == i ? "active" : "";
				str += "<li class='page-item " + active
				+"'><a class='page-link' ";
				str += "href='" + i + "'>" + i + "</a></li>";
			}
			if (next) {
				str += "<li class='page-item'>";
				str += "<a class='page-link' href='";
				str += (endNum + 1) + "'>다음</a></li>";
			}
			str += "</ul>";
			console.log(str);
			replyPageFooter.html(str);
		}
		
		replyPageFooter.on("click", "li a", function(e) {
			e.preventDefault();
			var targetPageNum = $(this).attr("href");
			pageNum = targetPageNum;
			showList(pageNum);
		});
		
		
		var modalModBtn = $("#modalModBtn");
		var modalRemoveBtn = $("#modalRemoveBtn");
		
		$(".chat").on("click", "li", function(e) {
			var rno = $(this).data("rno");
			console.log(rno);
			
			replyService.get(rno, function(reply) {
				modalInputReply.val(reply.reply);
				modalInputReplyer.val(reply.replyer).attr("readonly","readonly");
				modalInputReplyDate.val(replyService.displayTime(reply.replyDate))
				.attr("readonly","readonly");
				
				modal.data("rno", reply.rno);
				modal.find("button[id != 'modalCloseBtn']").hide();
				
				var originalReplyer = reply.replyer;
				
				if (replyer == originalReplyer) {
					modalModBtn.show();
					modalRemoveBtn.show();
				}
				$("#myModal").modal("show");
			});
		});
		
		modalModBtn.on("click", function(e) {
			var originalReplyer = modalInputReplyer.val();
			
			var reply = {
					rno: modal.data("rno"),
					reply: modalInputReply.val(),
					replyer: originalReplyer
			};
			
			if (!replyer) {
				alert("로그인 후 수정 가능");
				modal.modal("hide");
				return;
			}
			if (replyer != originalReplyer) {
				alert("자신이 작성한 댓글만 수정 가능");
				modal.modal("hide");
				return;
			}
			replyService.update(reply, function(result) {
				alert(result);
				modal.modal("hide");
				showList(pageNum);
			});
		});
		
		modalRemoveBtn.on("click", function(e) {
			var rno = modal.data("rno");
			var originalReplyer = modalInputReplyer.val();
			
			if (!replyer) {
				alert("로그인 후 삭제 가능");
				modal.modal("hide");
				return;
			}
			if (replyer != originalReplyer) {
				alert("자신이 작성한 댓글만 삭제 가능");
				modal.modal("hide");
				return;
			}
			
			replyService.remove(rno, originalReplyer, function(result){
				alert(result);
				modal.modal("hide");
				showList(pageNum);
			});
		});
		
		(function() {
			var bno='<c:out value="${board.bno}"/>';
			
			$.getJSON("/board/getAttachList", {bno:bno}, function(arr){
				console.log(arr);
				
				var str="";
				$(arr).each(function(i,attach){
					str += "<li data-path='";
					str += attach.uploadPath+"' data-uuid='";
					str += attach.uuid+"' data-filename='";
					str += attach.fileName+"' data-type='";
					str += attach.fileType+"'><div>";
					str += "<img src='/resources/img/attach.png' width='20' height='20'>";
					str += "<span>"+attach.fileName+"</span><br/>";
					str += "</div></li>";
				}) //each end
				$(".uploadResult ul").html(str);
			}); //getJSON end
		})(); //익명즉시실행함수 end
		
		$(".uploadResult").on("click", "li", function(e) {
			console.log("download file");
			var liObj = $(this);
			var path = encodeURIComponent(liObj.data("path")+"/"+liObj.data("uuid")+"_"+liObj.data("filename"));
			self.location = "/download?fileName="+path;
		}); //uploadResult li click end		
		var formObj = $("form");
		
		//글읽기 페이지의 수정버튼
		$("#boardModBtn").on("click", function(e) {
			e.preventDefault();
			var operation = $(this).data("oper");
			console.log(operation);
			if (operation === 'modify') {
				formObj.attr("action", "/board/modify");
			}
			formObj.submit();
		});
		
		//글읽기 페이지의 목록버튼
		$("#boardListBtn").on("click", function(e) {
			e.preventDefault();
			var operation = $(this).data("oper");
			console.log(operation);
			if (operation === 'list') {
				formObj.attr("action", "/board/list");
				formObj.find("#bno").remove();
			}
			formObj.submit();
		});
		
	}); //document ready end
</script>