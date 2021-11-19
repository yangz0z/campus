<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt"%>

<%@ include file="../includes/header.jsp"%>


<!DOCTYPE html>
<html lang="en">


<!-- Page Heading -->
<h1 class="h3 mb-2 text-gray-800">Tables</h1>
<p class="mb-4">
	DataTables is a third party plugin that is used to generate the demo
	table below. For more information about DataTables, please visit the <a
		target="_blank" href="https://datatables.net">official DataTables
		documentation</a>.
</p>

<!-- DataTales Example -->
<div class="card shadow mb-4">
	<div class="card-header py-3" align="right">
		<button id="regBtn" style="color: green;">글쓰기</button>
	</div>
	<div class="card-body">
		<div class="table-responsive">
			<table class="table table-bordered" id="dataTable" width="100%"
				cellspacing="0">
				<thead>
					<tr>
						<th>#번호</th>
						<th>제목</th>
						<th>작성자</th>
						<th>작성일</th>
						<th>수정일</th>
					</tr>
				</thead>
				<tbody>
					<c:forEach var="board" items="${list}">
						<tr>
							<td>${board.bno }</td>
							<td><a href="${board.bno}" class="move"><c:out value="${board.title }" />
								<c:if test="${board.replyCnt ne 0 }">
									<span style="color:red;">[
									<c:out value="${board.replyCnt }"/>]</span>
								</c:if>
							</a></td>
							<td><c:out value="${board.writer }" /></td>
							<td><fmt:formatDate pattern="yyyy-MM-dd" value="${board.regdate }" /></td>
							<td><fmt:formatDate pattern="yyyy-MM-dd" value="${board.updateDate }" /></td>
						</tr>
					</c:forEach>
				</tbody>
			</table>
			
			<!-- 검색창 -->
			<br/>
			<div>
				<div class="col-lg-12">
					<form id="searchForm" action="/board/list" method="get">
						<select name="type">
							<option value="" ${pageMaker.cri.type==null?"selected":""}>--</option>
							<option value="T" ${pageMaker.cri.type=="T"?"selected":""}>제목</option>
							<option value="C" ${pageMaker.cri.type=="C"?"selected":""}>내용</option>
							<option value="W" ${pageMaker.cri.type=="W"?"selected":""}>작성자</option>
							<option value="TC" ${pageMaker.cri.type=="TC"?"selected":""}>제목+내용</option>
							<option value="TW" ${pageMaker.cri.type=="TW"?"selected":""}>내용+작성자</option>
							<option value="TWC" ${pageMaker.cri.type=="TWC"?"selected":""}>제목+내용+작성자</option>
						</select>
						<input type="text" name="keyword" value="${pageMaker.cri.keyword }"/>
						<input type="hidden" name="amount" value="${pageMaker.cri.amount }"/>
						<button class="btn btn-warning">Search</button>
					</form>
				</div>
			</div>
			<br/>
			
			<!-- 페이지번호 -->
			<div>
				<ul class="pagination justify-content-center">
					<c:if test="${pageMaker.prev}">
						<li class="page-item"><a href="${pageMaker.startPage-1 }" class="page-link">이전</a></li>
					</c:if>
					<c:forEach var="num" begin="${pageMaker.startPage}" end="${pageMaker.endPage}">
						<li class='page-item ${pageMaker.cri.pageNum==num?"active":"" }'>
							<a href="${num }" class="page-link">${num }</a>
						</li>
					</c:forEach>
					<c:if test="${pageMaker.next}">
						<li class="page-item"><a href="${pageMaker.endPage+1 }" class="page-link">다음</a></li>
					</c:if>
				</ul>
			</div>
			
			<form id="actionForm" action="/board/list" method="get">
				<input type="hidden" name="pageNum" value="${pageMaker.cri.pageNum }">
				<input type="hidden" name="amount" value="${pageMaker.cri.amount }">
				<input type="hidden" name="type" value="${pageMaker.cri.type }">
				<input type="hidden" name="keyword" value="${pageMaker.cri.keyword }">
			</form>
			
		</div>
	</div>
</div>

<!-- Modal -->
<div class="modal fade" id="myModal" tabindex="-1" role="dialog"
	aria-labelledby="exampleModalLabel" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header"></div>
			<div class="modal-body" align="center"></div>
			<div class="modal-footer">
				<button class="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
			</div>
		</div>
	</div>
</div>



<script>
	$(document).ready(function() {
		$('#dataTable').DataTable({
			"order" : [[0, "desc"]],
			"paging" : false,
			"bFilter" : false,
			"info" : false
		});
		
		//글쓰기버튼
		$("#regBtn").on("click", function(){
			self.location = "/board/register";
		});
		
		
		//모달창띄우기
		var result = '<c:out value="${result}"/>';
		checkModal(result);
		function checkModal(result) {
			if (result === '') {
				return;
			}
			if ($.isNumeric(result)) {
				if (parseInt(result) > 0) {
					$(".modal-body").html("게시글 "+parseInt(result) + "번이 등록되었습니다.");
				}
			} else {
				$(".modal-body").html(result);
			}
			$("#myModal").modal("show");
		}
		
		//페이징
		var actionForm = $("#actionForm");
		$(".page-item a").on("click", function(e) {
			e.preventDefault();
			console.log("click");
			actionForm.find("input[name='pageNum']").val($(this).attr("href"));
			actionForm.submit();
		});
		
		//글 제목 하이퍼링크
 		$(".move").on("click", function(e) {
			e.preventDefault();
			actionForm.append("<input type='hidden' name='bno' " + "value='"+$(this).attr("href")+"'>");
			actionForm.attr("action", "/board/get");
			actionForm.submit();
		}); 
		
		//검색시 유효성 검사
		var searchForm = $("#searchForm");
		$("#searchForm button").on("click", function(e) {
			if(!searchForm.find("option:selected").val()) {
				alert("검색 종류를 선택하세요.");
				return false;
			}
			if(!searchForm.find("input[name='keyword']").val()){
				alert("키워드를 입력하세요.")
				return false;
			}
			searchForm.find("input[name='pageNum']").val(1);
			e.preventDefault();
			searchForm.submit();
		});
		
	}); //document ready end
</script>

<%@ include file="../includes/footer.jsp"%>