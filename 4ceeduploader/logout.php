<?php
    session_start();
    session_destroy();
    header('Location: /4ceeduploader/login.php');
?>