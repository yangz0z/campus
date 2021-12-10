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
<title>Shoppers &mdash; Colorlib e-Commerce Template</title>
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

	<input type="hidden" id="cnt" name="cnt" value="1000">
	<!-- 화면에는 보이지는 않음(내부에만 보이는것) 데이터베이스를 가져와서 총 건수를 알아올때 -->

<div class="container">
		<br><br><br>
			<h3>
				SHOP 검색결과&emsp;
			<input type="submit" class="btn btn-sm btn-primary " value="더보기">
			</h3>
			<!-- 레코드의 갯수를 출력 -->
			<table width="1200px">
				<thead>
					<tr>
						<th>제목&emsp;&emsp;&emsp;&emsp;&emsp;</th>
						<th>작성자&emsp;&emsp;</th>
						<th>작성일</th>
					</tr>
				</thead>
				<tbody>
					<c:forEach var="board" items="${list}">
						<tr>
							<td>내용</td>
							<td>내용</td>
							<td>내용</td>
						</tr>
					</c:forEach>
				</tbody>
			</table>
		
		<br> <br> <br> <br> <br> <br> <br>
		<br> <br> <br> <br> <br> <br> <br>
		<br> <br> <br> <br> <br> <br>

		<h3>COMMUNITY 검색결과
			<input type="submit" class="btn btn-sm btn-primary " value="더보기">
		</h3>
		<!-- 레코드의 갯수를 출력 -->
		<table width="1200px">
			<thead>
				<tr>
					<th>제목&emsp;&emsp;&emsp;</th>
					<th>작성자&emsp;&emsp;</th>
					<th>작성일</th>
				</tr>
			</thead>
			<tbody>
				<c:forEach var="board" items="${list}">
					<tr>
						<td>내용</td>
						<td>내용</td>
						<td>내용</td>
					</tr>
				</c:forEach>
			</tbody>
		</table>
</div>
<br><br><br><br><br><br>
		

</body>
</html>
<%@ include file="../includes/footer.jsp"%>