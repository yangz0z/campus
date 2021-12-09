<%@ page language="java" contentType="text/html; charset=UTF-8"
   pageEncoding="UTF-8"%>
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

   <div class="site-wrap">
      <header class="site-navbar" role="banner">
         <div class="site-navbar-top">
            <div class="container">
               <div class="row align-items-center">

                  <div
                     class="col-6 col-md-4 order-2 order-md-1 site-search-icon text-left">
                     <form action="" class="site-block-top-search">

                        <input type="text" class="form-control border-0"
                           placeholder="Search"> <span class="icon icon-search2"></span>
                        <div id="pager"></div>
                        <!-- 서치 페이징 부분 -->
                     </form>
                  </div>

                  <div
                     class="col-12 mb-3 mb-md-0 col-md-4 order-1 order-md-2 text-center">
                     <div class="site-logo">
                        <a href="/resources/index.html" class="js-logo-clone">CAMP-US</a>
                     </div>
                  </div>

                  <div class="col-6 col-md-4 order-3 order-md-3 text-right">
                     <div class="site-top-icons">
                        <ul>
                           <!-- <li><a href="#"><span class="icon icon-person"></span></a></li> -->


                           <aside class="site-navigation text-right text-md-center"
                              role="navigation">
                              <div class="container">
                                 <ul class="site-menu js-clone-nav d-none d-md-block has-children">
                                    <li class="has-children active"><span
                                       class="icon icon-person"></span>
                                       <ul class="dropdown">
                                          <li><a href="#">Edit Profile</a></li>
                                          <li><a href="#">My Shopping</a></li>
                                          <li><a href="#">My Community</a></li><!-- 
                                          <li class=""><a href=""></a>
                                             <ul class="">
                                                <li><a href=""></a></li>
                                                <li><a href=""></a></li>
                                                <li><a href=""></a></li>
                                             </ul></li> -->
                                       </ul></li>
                                    <li><a href="#"><span class="icon icon-heart-o"></span></a>
                                       <a href="#"><span class="icon icon-shopping_cart"></span></a>
                                    </li>
                                 </ul>
                              </div>
                           </aside>
                           
                           <!-- <li class="has-children"><a href="/resources/about.html">BACKPACKING</a>
                     <ul class="dropdown">
                        <li><a href="#">Menu One</a></li>
                        <li><a href="#">Menu Two</a></li>
                        <li><a href="#">Menu Three</a></li>
                     </ul></li> -->



                           <li><a href="/resources/cart.html" class="site-cart">
                                 <!-- 
                      <span class="icon icon-shopping_cart"></span>
                      <span class="count">2</span> -->
                           </a></li>
                           <li class="d-inline-block d-md-none ml-md-0"><a href="#"
                              class="site-menu-toggle js-menu-toggle"><span
                                 class="icon-menu"></span></a></li>
                        </ul>
                     </div>
                  </div>

               </div>
            </div>
         </div>
         <nav class="site-navigation text-right text-md-center"
            role="navigation">
            <div class="container">
               <ul class="site-menu js-clone-nav d-none d-md-block">
                  <li class="has-children active"><a
                     href="/resources/index.html">CAMPING</a>
                     <ul class="dropdown">
                        <li><a href="#">Menu One</a></li>
                        <li><a href="#">Menu Two</a></li>
                        <li><a href="#">Menu Three</a></li>
                        <li class="has-children"><a href="#">Sub Menu</a>
                           <ul class="dropdown">
                              <li><a href="#">Menu One</a></li>
                              <li><a href="#">Menu Two</a></li>
                              <li><a href="#">Menu Three</a></li>
                           </ul></li>
                     </ul></li>
                  <li class="has-children"><a href="/resources/about.html">BACKPACKING</a>
                     <ul class="dropdown">
                        <li><a href="#">Menu One</a></li>
                        <li><a href="#">Menu Two</a></li>
                        <li><a href="#">Menu Three</a></li>
                     </ul></li>
                  <li><a href="/resources/shop.html">PICNIC</a></li>
                  <li><a href="#">SALE</a></li>
                  <li><a href="#">COMMUNITY</a></li>
                  <li><a href="/resources/contact.html">Contact</a></li>
               </ul>
            </div>
         </nav>
      </header>

      <!-- header -->


      <div class="site-blocks-cover"
         style="background-image: url(/resources/images/title.png);"
         data-aos="fade">
         <div class="container">
            <div
               class="row align-items-start align-items-md-center justify-content-end">
               <!--  <div class="col-md-5 text-center text-md-left pt-5 pt-md-0">
            <h1 class="mb-2">Finding Your Perfect Shoes</h1>
            <div class="intro-text text-center text-md-left">
              <p class="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus at iaculis quam. Integer accumsan tincidunt fringilla. </p>
              <p>
                <a href="#" class="btn btn-sm btn-primary">Shop Now</a>
              </p> -->
            </div>
         </div>
      </div>
   </div>
   </div>

   <div class="site-section site-section-sm site-blocks-1">
      <div class="container">
         <div class="row">
            <div class="col-md-6 col-lg-4 d-lg-flex mb-4 mb-lg-0 pl-4"
               data-aos="fade-up" data-aos-delay="">
               <div class="icon mr-4 align-self-start">
                  <span class="icon-truck"></span>
               </div>
               <div class="text">
                  <h2 class="text-uppercase">Free Shipping</h2>
                  <p>무료 배송 부분.</p>
               </div>
            </div>
            <div class="col-md-6 col-lg-4 d-lg-flex mb-4 mb-lg-0 pl-4"
               data-aos="fade-up" data-aos-delay="100">
               <div class="icon mr-4 align-self-start">
                  <span class="icon-refresh2"></span>
               </div>
               <div class="text">
                  <h2 class="text-uppercase">RENTAL SERVICE</h2>
                  <p>대여 부분</p>
               </div>
            </div>
            <div class="col-md-6 col-lg-4 d-lg-flex mb-4 mb-lg-0 pl-4"
               data-aos="fade-up" data-aos-delay="200">
               <div class="icon mr-4 align-self-start">
                  <span class="icon-user"></span>
               </div>
               <div class="text">
                  <h2 class="text-uppercase">TRAVELER COMMUNITY</h2>
                  <p>커뮤니티 부분</p>
               </div>
            </div>
         </div>
      </div>
   </div>

   <div class="site-section site-blocks-2">
      <div class="container">
         <div class="row">
            <div class="col-sm-6 col-md-6 col-lg-4 mb-4 mb-lg-0" data-aos="fade"
               data-aos-delay="">
               <a class="block-2-item" href="#">
                  <figure class="image">
                     <img src="/resources/images/Camping.png" alt="" class="img-fluid">
                  </figure>
                  <div class="text">
                     <span class="text-uppercase">Collections</span>
                     <h3>Camping</h3>
                  </div>
               </a>
            </div>
            <div class="col-sm-6 col-md-6 col-lg-4 mb-5 mb-lg-0" data-aos="fade"
               data-aos-delay="100">
               <a class="block-2-item" href="#">
                  <figure class="image">
                     <img src="/resources/images/Backpacking.png" alt=""
                        class="img-fluid">
                  </figure>
                  <div class="text">
                     <span class="text-uppercase">Collections</span>
                     <h3>Backpacking</h3>
                  </div>
               </a>
            </div>
            <div class="col-sm-6 col-md-6 col-lg-4 mb-5 mb-lg-0" data-aos="fade"
               data-aos-delay="200">
               <a class="block-2-item" href="#">
                  <figure class="image">
                     <img src="/resources/images/Picnic.png" alt="" class="img-fluid">
                  </figure>
                  <div class="text">
                     <span class="text-uppercase">Collections</span>
                     <h3>Picnic</h3>
                  </div>
               </a>
            </div>
         </div>
      </div>
   </div>

   <div class="site-section block-3 site-blocks-2 bg-light">
      <div class="container">
         <div class="row justify-content-center">
            <div class="col-md-7 site-section-heading text-center pt-4">
               <h2>Recommended items</h2>
            </div>
         </div>
         <div class="row">
            <div class="col-md-12">
               <div class="nonloop-block-3 owl-carousel">
                  <div class="item">
                     <div class="block-4 text-center">
                        <figure class="block-4-image">
                           <img src="/resources/images/cloth_1.jpg"
                              alt="Image placeholder" class="img-fluid">
                        </figure>
                        <div class="block-4-text p-4">
                           <h3>
                              <a href="#">Tank Top</a>
                           </h3>
                           <p class="mb-0">Finding perfect t-shirt</p>
                           <p class="text-primary font-weight-bold">$50</p>
                        </div>
                     </div>
                  </div>
                  <div class="item">
                     <div class="block-4 text-center">
                        <figure class="block-4-image">
                           <img src="/resources/images/shoe_1.jpg" alt="Image placeholder"
                              class="img-fluid">
                        </figure>
                        <div class="block-4-text p-4">
                           <h3>
                              <a href="#">Corater</a>
                           </h3>
                           <p class="mb-0">Finding perfect products</p>
                           <p class="text-primary font-weight-bold">$50</p>
                        </div>
                     </div>
                  </div>
                  <div class="item">
                     <div class="block-4 text-center">
                        <figure class="block-4-image">
                           <img src="/resources/images/cloth_2.jpg"
                              alt="Image placeholder" class="img-fluid">
                        </figure>
                        <div class="block-4-text p-4">
                           <h3>
                              <a href="#">Polo Shirt</a>
                           </h3>
                           <p class="mb-0">Finding perfect products</p>
                           <p class="text-primary font-weight-bold">$50</p>
                        </div>
                     </div>
                  </div>
                  <div class="item">
                     <div class="block-4 text-center">
                        <figure class="block-4-image">
                           <img src="/resources/images/cloth_3.jpg"
                              alt="Image placeholder" class="img-fluid">
                        </figure>
                        <div class="block-4-text p-4">
                           <h3>
                              <a href="#">T-Shirt Mockup</a>
                           </h3>
                           <p class="mb-0">Finding perfect products</p>
                           <p class="text-primary font-weight-bold">$50</p>
                        </div>
                     </div>
                  </div>
                  <div class="item">
                     <div class="block-4 text-center">
                        <figure class="block-4-image">
                           <img src="/resources/images/shoe_1.jpg" alt="Image placeholder"
                              class="img-fluid">
                        </figure>
                        <div class="block-4-text p-4">
                           <h3>
                              <a href="#">Corater</a>
                           </h3>
                           <p class="mb-0">Finding perfect products</p>
                           <p class="text-primary font-weight-bold">$50</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>

   <div class="site-section block-8">
      <div class="container">
         <div class="row justify-content-center  mb-5">
            <div class="col-md-7 site-section-heading text-center pt-4">
               <h2>Big Sale!</h2>
            </div>
         </div>
         <div class="row align-items-center">
            <div class="col-md-12 col-lg-7 mb-5">
               <a href="#"><img src="/resources/images/blog_1.jpg"
                  alt="Image placeholder" class="img-fluid rounded"></a>
            </div>
            <div class="col-md-12 col-lg-5 text-center pl-md-5">
               <h2>
                  <a href="#">UP TO 50% SALE</a>
               </h2>
               <p class="post-meta mb-4">
                  By <a href="#">Carl Smith</a> <span class="block-8-sep">&bullet;</span>
                  September 3, 2018
               </p>
               <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                  Quisquam iste dolor accusantium facere corporis ipsum animi
                  deleniti fugiat. Ex, veniam?</p>
               <p>
                  <a href="#" class="btn btn-primary btn-sm">Shop Now</a>
               </p>
            </div>
         </div>
      </div>
   </div>

   <footer class="site-footer border-top">

      <div class="container">
         <!--      <div class="row">
          <div class="col-lg-6 mb-5 mb-lg-0">
            <div class="row">
              <div class="col-md-12">
                <h3 class="footer-heading mb-4">Navigations</h3>
              </div>
              <div class="col-md-6 col-lg-4">
                <ul class="list-unstyled">
                  <li><a href="#">Sell online</a></li>
                  <li><a href="#">Features</a></li>
                  <li><a href="#">Shopping cart</a></li>
                  <li><a href="#">Store builder</a></li>
                </ul>
              </div>
              <div class="col-md-6 col-lg-4">
                <ul class="list-unstyled">
                  <li><a href="#">Mobile commerce</a></li>
                  <li><a href="#">Dropshipping</a></li>
                  <li><a href="#">Website development</a></li>
                </ul>
              </div>
              <div class="col-md-6 col-lg-4">
                <ul class="list-unstyled">
                  <li><a href="#">Point of sale</a></li>
                  <li><a href="#">Hardware</a></li>
                  <li><a href="#">Software</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div class="col-md-6 col-lg-3 mb-4 mb-lg-0">
            <h3 class="footer-heading mb-4">Promo</h3>
            <a href="#" class="block-6">
              <img src="/resources/images/hero_1.jpg" alt="Image placeholder" class="img-fluid rounded mb-4">
              <h3 class="font-weight-light  mb-0">Finding Your Perfect Shoes</h3>
              <p>Promo from  nuary 15 &mdash; 25, 2019</p>
            </a>
          </div> -->
         <div class="col-md-6 col-lg-3">
            <div class="block-5 mb-5">
               <h3 class="footer-heading mb-4">Contact Info</h3>
               <ul class="list-unstyled">
                  <li class="address">인천일보 아카데미 인천 미추홀구 메소홀로488번길</li>
                  <li class="phone"><a href="tel://23923929210">+82
                        01-0000-0000</a></li>
                  <li class="email">whdvkf2000@naver.com</li>
               </ul>
            </div>

            <!-- <div class="block-7">
              <form action="#" method="post">
                <label for="email_subscribe" class="footer-heading">Subscribe</label>
                <div class="form-group">
                  <input type="text" class="form-control py-4" id="email_subscribe" placeholder="Email">
                  <input type="submit" class="btn btn-sm btn-primary" value="Send">
                </div>
              </form>
            </div> -->

         </div>
      </div>
      <div class="row pt-5 mt-5 text-center">
         <div class="col-md-12">
            <p>
               <!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. -->

               <!-- Copyright &copy;<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/
            cloudflare-static/email-decode.min.js"></script><script>document.write(new Date().
            getFullYear());</script> All rights reserved | This template is made with <i class="icon-heart" 
            aria-hidden="true"></i> by <a href="https://colorlib.com" target="_blank" class="text-primary">Colorlib</a> -->


               <!-- Link back to Colorlib can't be removed. Template is licensed under CC BY 3.0. -->
            </p>
         </div>

      </div>
      </div>
   </footer>
   </div>

   <script src="/resources/js/jquery-3.3.1.min.js"></script>
   <script src="/resources/js/jquery-ui.js"></script>
   <script src="/resources/js/popper.min.js"></script>
   <script src="/resources/js/bootstrap.min.js"></script>
   <script src="/resources/js/owl.carousel.min.js"></script>
   <script src="/resources/js/jquery.magnific-popup.min.js"></script>
   <script src="/resources/js/aos.js"></script>
   <script src="/resources/js/main.js"></script>

   <!-- 서치 페이징 처리 스크립트 -->
   <script type="text/javascript">
      $(document).ready(function() {
         //.icon-search2")
         $(document).on("click", ".icon-search2", function() {
            alert("검색창 테스트")
            window.location.href = "search.jsp"
         })
         //  getPager()
      });
   </script>

</body>
</html>