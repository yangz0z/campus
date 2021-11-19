<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt"%>

<%@ include file="includes/header.jsp"%>

<div class="row">
	<div class="col-lg-12">
		<div class="panel panel-default">
			<h1>로그아웃 처리</h1>
			<h2>${error}</h2>
			<h2>${logout}</h2>
			
			<div class=panel-body">
				<form role="form" method="post" action="/customLogout">
					<fieldset>
						<a href="index.html" class="btn btn-lg btn-success btn-block">logout</a>
					</fieldset>
					<input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}"/>
				</form>
			</div>
		</div>
	</div>
</div>

<script>
	$(".btn-success").on("click", function(e) {
		e.preventDefault();
		$("form").submit();
	});
</script>

<c:if test="${param.logout != null}">
	<script>
		$(document).ready(function() {
			alert("로그아웃");
		});
	</script>
</c:if>

<%@ include file="includes/footer.jsp"%>