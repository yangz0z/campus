<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt"%>

<%@ include file="../includes/header.jsp"%>

<div class="row">
	<div class="col-lg-12">
		<h1 class="page-header">글 수정</h1>
	</div>
</div>

<div class="row">
	<div class="col-lg-12">
		<div class="panel panel-default">
			<div class="panel-heading">글쓰기</div>
			<div class="panel-body"></div>

			<form role="form" action="/board/modify" method="post">
			
				<input type="hidden" name="${_csrf.parameterName }" value="${_csrf.token }"/>
				
				<input type="hidden" name="bno" value="${board.bno }"/>
				<input type="hidden" name="pageNum" value="${cri.pageNum }"/>
				<input type="hidden" name="amount" value="${cri.amount }"/>
				<input type="hidden" name="type" value="${cri.type }"/>
				<input type="hidden" name="keyword" value="${cri.keyword }"/>
				
				<div class="form-group">
					<label>제목</label> <input class="form-control" name="title"
						value='<c:out value="${board.title }"/>'>
				</div>
				<div class="form-group">
					<label>내용</label>
					<textarea class="form-control" row="3" name="content"><c:out value="${board.content }" /></textarea>
				</div>
				<div class="form-group">
					<label>작성자</label> <input class="form-control" name="writer"
						value='<c:out value="${board.writer }"/>' readonly>
				</div>

				<sec:authentication property="principal" var="pinfo"/>
				<sec:authorize access="isAuthenticated()">
					<c:if test="${pinfo.username eq board.writer}">
						<button type="submit" data-oper="modify" class="btn btn-success">수정</button>
						<button type="submit" data-oper="remove" class="btn btn-danger">삭제</button>
					</c:if>
				</sec:authorize>
				<button type="submit" data-oper="list" class="btn btn-info">목록</button>
			</form>
		</div>
	</div>
</div>

<br/>
<div class="row">
	<div class="col-lg-12">
		<div class="panel panel-default">
			<div class="panel-heading">
				<div class="panel-body">
					<div class="form-group uploadDiv">
						파일첨부: <input type="file" name="uploadFile" multiple>
					</div>
					<div class="uploadResult">
						<ul></ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<script>
	$(document).ready(function(){
		var formObj = $("form");
		$('button').on("click",function(e){
			e.preventDefault();
			var operation = $(this).data("oper");
			console.log(operation);
			
			if (operation === 'remove') {
				formObj.attr("action", "/board/remove");
			} else if (operation === 'list') {
				formObj.attr("action", "/board/list").attr("method","get");
	
				var pageNumTag=$("input[name='pageNum']");
				var amountTag=$("input[name='amount']");
				var keywordTag=$("input[name='keyword']");
				var typeTag=$("input[name='type']");
				
				formObj.empty();
				formObj.append(pageNumTag);
				formObj.append(amountTag);
				formObj.append(keywordTag);
				formObj.append(typeTag);
			} else if (operation === 'modify') {
				var str="";
				$(".uploadResult ul li").each(function(i, obj){
					var jobj = $(obj);
					console.dir(jobj);
					console.log("-------------------");
					console.log(jobj.data("filename"));
					
					str += "<input type='hidden' name='attachList[";
					str += i+"].fileName' value='"+jobj.data("filename");
					str += "'>";
					
					str += "<input type='hidden' name='attachList[";
					str += i+"].uuid' value='"+jobj.data("uuid");
					str += "'>";
					
					str += "<input type='hidden' name='attachList[";
					str += i+"].uploadPath' value='"+jobj.data("path");
					str += "'>";
					
					str += "<input type='hidden' name='attachList[";
					str += i+"].fileType' value='"+jobj.data("type");
					str += "'>";
				}) //li each end
				formObj.append(str);
				console.log(str);
			}
			formObj.submit();
		});
		
		(function() {
			var bno = '<c:out value="${board.bno}"/>'; //화면상에 공유된 bno값을 가져와 사용 준비
			$.getJSON("/board/getAttachList", {bno:bno}, function(arr){
				console.log(arr);
				
				var str="";
				$(arr).each(function(i,attach){
					var fileCallPath = encodeURIComponent(attach.uploadPath + "/" + attach.uuid + "_" + attach.fileName);
					
					str+="<li data-path='";
					str+=attach.uploadPath+"' data-uuid='";
					str+=attach.uuid+"' data-filename='";
					str+=attach.fileName+"' data-type='";
					str+=attach.fileType+"'><div>";
					str+="<img src='/resources/img/attach.png' width='20' height='20'>";
					str+="<span>"+attach.fileName+"</span>&nbsp;&nbsp;";
					str+="<b data-file='"+fileCallPath;
					str+="' data-type='file'>[x]</b>";
					
					str+="</div></li>";
				});
				$(".uploadResult ul").html(str);
			});
		})();
		
		var csrfHeaderName = "${_csrf.headerName}";
		var csrfTokenValue = "${_csrf.token}";
		
		$(".uploadResult").on("click", "b", function(e){
			console.log("delete file");
			
			var delConfirm = confirm('선택한 파일을 삭제하시겠습니까?\n예를 선택하면 복구 불가합니다.');
			
			if (delConfirm) {
				var targetFile = $(this).data("file");
				var type = $(this).data("type");
				var targetLi = $(this).closest("li");
				
				$.ajax({
					url: '/deleteFile',
					data: {fileName: targetFile, type: type},
					dataType: 'text',
					beforeSend: function(xhr) {
						xhr.setRequestHeader(csrfHeaderName, csrfTokenValue);
					},
					type: 'POST',
					success: function(result){
						alert(result);
						targetLi.remove();
					}
				});
			} else {
				return;
			}
		});
		
		var regex = new RegExp("(.*?)\.(exe|sh|zip|alz)$");
		var maxSize = 5242880;
		
		function checkExtension (fileName, fileSize) {
			if (fileSize >= maxSize) {
				alert("파일 크기 초과");
				return false;
			}
			if (regex.test(fileName)) {
				alert("해당 종류의 파일은 업로드가 불가합니다.");
				return false;
			}
			return true;
		}
		
		$("input[type='file']").change(function(e) {
			var formData = new FormData;
			var inputFile = $("input[name='uploadFile']");
			var files = inputFile[0].files;
			
			for (var i=0; i<files.length; i++) {
				if (!checkExtension(files[i].name, files[i].size)) {
					return false;
				}
				formData.append("uploadFile", files[i]);
			}
			$.ajax({
				url: '/uploadAjaxAction',
				processData: false,
				contentType: false,
				data: formData,
				beforeSend: function(xhr) {
					xhr.setRequestHeader(csrfHeaderName, csrfTokenValue);
				},
				type: 'POST',
				dataType: 'json',
				success: function(result){
					console.log(result);
					showUploadResult(result);
				}
			}); //ajax
		});
		
		function showUploadResult(uploadResultArr) {
			if (!uploadResultArr || uploadResultArr.length==0) {
				return;
			}
			var uploadUL = $(".uploadResult ul");
			var str = "";
			
			$(uploadResultArr).each(function(i, obj) {
				var fileCallPath = encodeURIComponent(obj.uploadPath + "/" + obj.uuid + "_" + obj.fileName);
				var fileLink = fileCallPath.replace(new RegExp(/\\/g), "/");
				
				str += "<li data-path='";
			    str += obj.uploadPath+"' data-uuid='";
		        str += obj.uuid+"' data-filename='";
			    str += obj.fileName+"' data-type='";
				str += obj.image+"'><div>";
				str += "<img src='/resources/img/attach.png' width='20' height='20'>";
				str += "<span>" + obj.fileName + "</span> ";
				str += "<b data-file='"+fileCallPath;
				str += "' data-type='file'>[x]</b>";
				str += "</div></li>";
			});
			uploadUL.append(str);
		}
		
		
	}) //document ready end
</script>