<?php

const TK_EXP = 5;
const MAX_RESULTS = 10;

$bdd = NULL;
$dbg = !empty($_GET["dbg"]);
$tet = microtime(true);

if (!$dbg) {
    error_reporting(0);
} else {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}

function debug($msg) {
    global $dbg;

    if ($dbg) {
        echo($msg);
    }
}

function listformat($l) {
    $s = json_encode($l, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE);
    $s = str_replace(PHP_EOL, "<br/>", $s);
    $s = str_replace(" ", "&nbsp;", $s);
    return($s);
}

function fgc($url, $method="GET", $hd=[], $p=[]) {
    $ch = curl_init();

    $headers=[];

    curl_setopt($ch, CURLOPT_HTTPHEADER, $hd);
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, $method=="POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $p);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

    curl_setopt($ch, CURLOPT_HEADERFUNCTION,
      function($curl, $header) use (&$headers)
      {
        $len = strlen($header);
        $header = explode(':', $header, 2);
        if (count($header) < 2) // ignore invalid headers
          return $len;

        $headers[strtolower(trim($header[0]))][] = trim($header[1]);

        return $len;
      }
    );

    $resp = curl_exec($ch);
    curl_close($ch);

    return([$resp, $headers]);
}

function gzd( $data ){
    $g=tempnam('/tmp','ff');
    @file_put_contents( $g, $data );
    ob_start();
    readgzfile($g);
    $d=ob_get_clean();
    unlink($g);
    return $d;
}

function cutbtw($s, $ss, $es) {
    $s = substr($s, strpos($s, $ss)+strlen($ss));
    $s = substr($s, 0, strpos($s, $es));

    return($s);
}

function cutbtwm($s, $ssl, $esl) {
    foreach($ssl as $ss) {
        $s = substr($s, strpos($s, $ss)+strlen($ss));
    }
    foreach($esl as $es) {
        $s = substr($s, 0, strpos($s, $es));
    }
    return($s);
}

function varName($var) {
    foreach($GLOBALS as $demo => $value) {
        if ($value === $var) {
            return $demo;
        }
    }
    return(false);
}

function mdtvi($pl=[]) {
    foreach ($pl as $p) {
        if (!isset($pl)) {
            err("A mandatory parameter wasn't specified");
        }
    }
}

function mdtpi($pl=[]) {
    $l = [];
    $vl = [];

    foreach ($pl as $p) {
        if (@!isset($_GET[$p])) {
            if (@!isset($_POST[$p])) {
                $l[] = $p;
            } else {
                $vl[] = $_POST[$p];
            }
        } else {
            $vl[] = $_GET[$p];
        }
    }

    if (count($l) != 0) {
        err("missing_parameters", "Mandatory parameters [".implode(", ", $l)."] weren't specified", 400, array("missing_parameters"=> $l));
    }

    return($vl);
}

function encrypt($t) {
    $dts = date("dmY");
    $hs = hash("sha256", hash_hmac("ripemd160", $t, $dts));
    return($hs);
}

function verify($p, $h) {
    return($h==encrypt($p));
}

function sqlinit() {
    global $bdd;

    if ($bdd!=null) {
        try {
            $stmt = $bdd->query("DELETE FROM tokens WHERE expiry_date<NOW()");
            return;
        } catch (PDOException $e) {
        }
    }
    $bdd = new PDO("mysql:host=localhost;dbname=manager", "manager", "lXs7tmCtIYCd8gz0K0UqqNs");

    try {
        $stmt = $bdd->query("DELETE FROM tokens WHERE expiry_date<NOW()");
        return;
    } catch (PDOException $e) {
        throw new Exception("Database Error: " . $e->getMessage(), 400);
    }
}

function ok($ct=null, $et=array()) {
    global $dbg;
    global $tet;

    $et["total"] = intval((microtime(true)-$tet)*1000);

    if ($dbg) {
        echo(listformat(array(
            "success"=> true,
            "content"=> $ct,
            "execution_time"=> $et
        )));
    } else {
        echo(json_encode(array(
            "success"=> true,
            "content"=> $ct,
            "execution_time"=> $et
        ), JSON_PRETTY_PRINT));
    }
    exit();
}

function err($ec="", $em="", $sc=400, $ct=null, $et=array()) {
    global $dbg;
    global $tet;

    $et["total"] = intval((microtime(true)-$tet)*1000);

    http_response_code($sc);

    if ($dbg) {
        echo(listformat(array(
            "success"=> false,
            "error_code"=> $ec,
            "error_message"=> $em,
            "content"=> $ct,
            "execution_time"=> $et
        )));
    } else {
        echo(json_encode(array(
            "success"=> false,
            "error_code"=> $ec,
            "error_message"=> $em,
            "content"=> $ct,
            "execution_time"=> $et
        ), JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
    }

    exit();
}

function req($q, $vars=array(), $ff=PDO::FETCH_ASSOC) { // PDO::FETCH_ASSOC, PDO::FETCH_NUM
    global $bdd;
    global $dbg;
    sqlinit();

    $ar=-1;
    $lid=-1;
    $r=[];
    try {
        $bdd->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $bdd->beginTransaction();

        $stmt = $bdd->prepare($q);
    
        foreach($vars as $k=>$v) {
            $stmt->bindValue(':'.$k, $v);
            if ($dbg) {
                echo(':'.$k." = ".$v."<br/>");
            }
        }
    
        $stmt->execute();
        $lid = $bdd->lastInsertId();
                
        if (str_contains($q, "SELECT")) {
            $r = $stmt->fetchAll($ff);
        }

        $ar = $stmt->rowCount();

        $bdd->commit();
    } catch (PDOException $e) {
        if ($bdd->inTransaction()) {
            $bdd->rollBack();
        }
        err("database_error", "DB Error: ".$e->getMessage(), 400);
        //throw new Exception("Database Error: " . $e->getMessage(), 400);
    } finally {
        $stmt = null;
        $bdd = null;
    }

    return([$r, $ar, $lid]);
}

function genToken($len=20) {
    return(bin2hex( random_bytes(intval($len/2)) ));
}

function rmTks() {
    req("DELETE FROM tokens WHERE expiry_date<=NOW()");
}

function vtk($tk, $f="id") {
    rmTks();

    [$r] = req("SELECT (SELECT $f FROM users WHERE id=tokens.user_id) as :fn FROM tokens WHERE value=:tk AND expiry_date>NOW() LIMIT 1", array("tk"=> $tk, "fn"=>$f))[0];

    return($r ? $r[$f] : false);
}

function vtki($tk) {
    $r = vtk($tk, "id");

    if ($r===false) {
        err("unidentified", "You need to login", 401);
    }
    return($r);
}

function vtkiu($tk) {
    $r = vtk($tk, "username");

    if ($r===false) {
        err("unidentified", "You need to login", 401);
    }
    return($r);
}

function getUserById($uid) {
    $r = req("SELECT * FROM users WHERE id=:id LIMIT 1", array("id"=> $uid))[0][0];

    return($r);
}

function getClient($cid) {
    $r = req("SELECT * FROM clients WHERE id=:id LIMIT 1", array("id"=> $cid))[0][0];

    return($r);
}

function clientRank($cid, $uid) {
    $r = req("SELECT id, (SELECT SUM(IF(received=-1, paid, received)) as tgain FROM projects WHERE user_id=:uid AND client_id=cl.id AND (received>0 OR paid>0)) as tgain FROM clients cl WHERE user_id=:uid ORDER by tgain DESC;", array(
        "uid"=>$uid
    ))[0];

    $i=0;
    for ($i=0; $i<count($r); $i++) {
        if ($r[$i]["id"] == $cid) {
            break;
        }
    }

    return($i+1);
}

function clientReport($cid, $uid) {
    $r = req("SELECT COUNT(name) as pcount, (SELECT SUM(IF(received=-1, paid, received)) as tgain FROM projects WHERE user_id=1 AND client_id=:cid AND (received>0 OR paid>0)) as tgain, SUM((SELECT SUM(duration) FROM tasks WHERE project_id=p.id)) as ttime FROM projects p WHERE user_id=:uid AND client_id=:cid;", array(
        "uid"=> $uid,
        "cid"=> $cid
    ))[0][0];

    $rk = clientRank($cid, $uid);
    $r["rank"] = $rk;
    $r["tgain"] = intval($r["tgain"]);
    $r["ttime"] = intval($r["ttime"]);

    return($r);
}



@$a = $_GET["a"];
@$tk = $_GET['tk'];
if (empty($tk)) {
    @$tk = explode(" ", explode(";", explode("token=", apache_request_headers()['Cookie'])[1])[0])[0];
}

if (!isset($a)) {
    //err("missing_a", "'a' parameter is mandatory");
    err("unknown_endpoint", "The '".$a."' endpoint is unknown", 400);
}

if ($a == "login") {
    [$un, $pass] = mdtpi(["user", "pass"]);

    if ($un=='' || $pass=='') {
        err("invalid_credentials", "Identifiant ou mot de passe invalide", 403);
    }

    $r = req("SELECT id,password FROM users WHERE username=:un", array("un"=> $un))[0][0];

    if ($r==NULL) {
        err("invalid_credentials", "Identifiant ou mot de passe invalide", 403);
    }

    if (password_verify($pass, $r["password"])) {
        $ntk = genToken(60);
        [$r, $mc] = req("INSERT INTO tokens (value, user_id, expiry_date) VALUES (:ntk, :uid, FROM_UNIXTIME(:tkexp))",
            array(
                "ntk"=> $ntk,
                "uid"=> $r["id"],
                "tkexp"=> time()+TK_EXP*3600
            )
        );

        if ($mc<=0) {
            err("unknown_error", "Unknown Error", 400);
        } else {
            ok(array("token"=> $ntk));
        }
    } else {
        err("invalid_credentials", "Identifiant ou mot de passe invalide", 403);
    }
}



else if ($a == "vtk") {
    $un = vtkiu($tk);

    ok(array(
        "username"=> $un
    ));
    
}





else if ($a == "globaldata") {
    $uid = vtki($tk);

    
}




else if ($a == "clients") {
    $uid = vtki($tk);

    $r = req("SELECT * FROM clients WHERE user_id=:uid ORDER BY name ASC", array("uid"=> $uid))[0];

    for($i=0; $i<count($r); $i++) {
        $cr = clientReport($r[$i]["id"], $uid);
        foreach($cr as $k=>$v) {
            $r[$i][$k]=$v;
        }
    }

    ok(array(
        "clients"=> $r
    ));
}




else if ($a == "client") {
    [$cid] = mdtpi(["client_id"]);
    $uid = vtki($tk);

    $r = req("SELECT * FROM clients WHERE id=:cid", array("cid"=> $cid))[0][0];

    $cr = clientReport($cid, $uid);

    foreach($cr as $k=>$v) {
        $r[$k]=$v;
    }

    ok(array(
        "client"=> $r
    ));
}



else if ($a == "setvalue") {
    [$id, $tb, $f, $v] = mdtpi(["id", "table", "field", "value"]);
    $uid = vtki($tk);

    $tables = array( # key => [table, columns, conditions, variables]
        "client"=> ["clients", ["name", "adress", "hourly_rate", "declared", "show_taxes", "type"], ["user_id=:uid"], array(
            "uid"=>$uid
        )],
        "project"=> ["projects", ["name", "description"], ["user_id=:uid"], array(
            "uid"=>$uid
        )],
        "task"=> ["tasks", ["name", "done", "price", "description", "started_at", "ended_at"], ["EXISTS(SELECT id FROM projects WHERE projects.id=tasks.project_id AND projects.user_id=:uid)"], array(
            "uid"=>$uid
        )],
        "user"=> ["users", [], ["id=:uid"], array(
            "uid"=>$uid
        )]
    );

    if (!array_key_exists($tb, $tables)) {
        err("unknown_error", "Unknown table", 400);
    }

    if (!in_array($f, $tables[$tb][1])) {
        err("unknown_column_name", "This column doesn't exist", 400);
    }

    $v=(($v===true || $v==="true") ? 1 : (($v===false || $v==="false") ? 0 : $v));


    $atb = $tables[$tb][0];
    
    $params = $tables[$tb][3];
    $params["id"]=$id;
    $params["v"]=$v;

    $conds = $tables[$tb][2];
    array_unshift($conds, "id=:id");
    $conds = implode(" AND ", $conds);

    [$r, $enb] = req("UPDATE $atb SET $f=:v WHERE $conds", $params);

    if ($enb > 0) {
        ok();
    } else {
        err("unknown_error", "Unknown Error", 500);
    }

}




else if ($a == "getvalue") {
    [$id, $tb, $f] = mdtpi(["id", "table", "field"]);
    $uid = vtki($tk);

    $tables = array( # key => [table, columns, conditions, variables]
        "client"=> ["clients", ["name", "adress", "hourly_rate", "declared", "show_taxes", "type"], ["user_id=:uid"], array(
            "uid"=>$uid
        )],
        "project"=> ["projects", ["name", "description"], ["user_id=:uid"], array(
            "uid"=>$uid
        )],
        "task"=> ["tasks", ["name", "done", "price", "description", "started_at", "ended_at"], ["EXISTS(SELECT id FROM projects WHERE projects.id=tasks.project_id AND projects.user_id=:uid)"], array(
            "uid"=>$uid
        )],
        "user"=> ["users", [], ["id=:uid"], array(
            "uid"=>$uid
        )]
    );

    if (!array_key_exists($tb, $tables)) {
        err("unknown_error", "Unknown table", 400);
    }

    if (!in_array($f, $tables[$tb][1])) {
        err("unknown_column_name", "The column '$f' doesn't exist", 400);
    }

    $atb = $tables[$tb][0];
    
    $params = $tables[$tb][3];
    $params["id"]=$id;

    $conds = $tables[$tb][2];
    array_unshift($conds, "id=:id");
    $conds = implode(" AND ", $conds);

    [$r, $enb] = req("SELECT $f FROM $atb WHERE $conds", $params);

    if ($enb > 0) {
        ok($r[0][$f]);
    } else {
        err("unknown_error", "Unknown Error", 500);
    }
}



else if ($a == "clientset") {
    [$cid, $f, $v] = mdtpi(["client_id", "field", "value"]);
    $uid = vtki($tk);

    $cl = getClient($cid);

    if ($cl["user_id"] != $uid) {
        err("unauthorized", "You can't edit this client", 403);
    }

    if (!in_array($f, ["name", "adress", "hourly_rate", "declared", "show_taxes", "type"])) {
        err("unknown_column_name", "This column doesn't exist", 400);
    }

    if (in_array($f, ["declared", "show_taxes"])) {
        $v=(($v===true || $v==="true") ? 1 : 0);
    }

    [$r, $enb] = req("UPDATE clients SET $f=:v WHERE id=:id", array("v"=>$v, "id"=>$cid));

    if ($enb > 0) {
        ok();
    } else {
        err("unknown_error", "Unknown Error", 500);
    }
}






else if ($a == "clientprojects") {
    [$cid] = mdtpi(["client_id"]);
    $uid = vtki($tk);

    $cl = getClient($cid);

    if ($cl["user_id"] != $uid) {
        err("unauthorized", "You don't have access to this client", 403);
    }

    $r = req("SELECT * FROM projects WHERE client_id=:cid AND user_id=:uid", array("cid"=>$cid, "uid"=>$uid))[0];

    ok(array(
        "projects"=> $r
    ));
}




else if ($a == "clientreport") {
    [$cid] = mdtpi(["client_id"]);
    $uid = vtki($tk);

    ok(array(
        "report"=> clientReport($cid, $uid)
    ));
}






else if ($a == "tasks") {
    [$pid] = mdtpi(["project_id"]);
    $uid = vtki($tk);

    $r = req("SELECT * FROM tasks WHERE project_id=:pid", array(
        "pid"=> $pid
    ))[0];

    ok($r);
}





else if ($a == "task") {
    [$tid] = mdtpi(["task_id"]);
    $uid = vtki($tk);

    $r = req("SELECT *,
        (SELECT name FROM projects WHERE id=tasks.project_id LIMIT 1) as project_name FROM tasks WHERE 
            id=:tid AND 
            EXISTS(SELECT id FROM projects WHERE projects.id=tasks.project_id AND projects.user_id=:uid)
        ", array(
        "uid"=> $uid,
        "tid"=> $tid
    ))[0][0];

    ok($r);
}





else if ($a == "addtask") {
    [$pid] = mdtpi(["project_id"]);
    $uid = vtki($tk);

    //err("implementation_in_progress", "This endpoint is not finished yet", 501);

    [$r, $enb, $tid] = req("INSERT INTO tasks (project_id) VALUES (:pid)", array(
        "pid"=> $pid
    ));

    if ($pid !== null) {
        ok(array(
            "task_id"=> $tid
        ));
    } else {
        err("unknown_error", "Unknown Error", 500);
    }
}





else if ($a == "project") {
    [$pid] = mdtpi(["project_id"]);
    $uid = vtki($tk);

    $r = req("SELECT *,(SELECT name FROM clients WHERE id=projects.client_id LIMIT 1) as client_name FROM projects WHERE id=:pid AND user_id=:uid", array(
        "uid"=> $uid,
        "pid"=> $pid
    ))[0][0];

    ok($r);
}



else if ($a == "addproject") {
    [$cid] = mdtpi(["client_id"]);
    $uid = vtki($tk);

    [$r, $enb, $pid] = req("INSERT INTO projects (client_id, user_id) VALUES (:cid, :uid)", array(
        "uid"=> $uid,
        "cid"=> $cid
    ));

    if ($pid !== null) {
        ok(array(
            "project_id"=> $pid
        ));
    } else {
        err("unknown_error", "Unknown Error", 500);
    }
}



else if ($a == "delclient") {
    [$cid] = mdtpi(["client_id"]);
    $uid = vtki($tk);

    $enb = req("DELETE FROM clients WHERE id=:cid AND user_id=:uid;", array(
        "uid"=> $uid,
        "cid"=> $cid
    ))[1];

    if ($enb > 0) {
        ok();
    } else {
        err("unknown_error", "Unknown Error", 500);
    }
}




else if ($a == "delentry") {
    [$pid, $type] = mdtpi(["id", "type"]);
    $uid = vtki($tk);

    $types = array(
        "projects"=> [["user_id=:uid"], array(
            "uid"=>$uid
        )],
        "clients"=> [["user_id=:uid"], array(
            "uid"=>$uid
        )],
        "tasks"=> [["EXISTS(SELECT id FROM projects WHERE projects.id=tasks.project_id AND projects.user_id=:uid)"], array(
            "uid"=>$uid
        )]
    );

    if (!array_key_exists($type, $types)) {
        err("unknown_item_type", "Unknown entry type", 400);
    }

    $conds = $types[$type][0];
    array_unshift($conds, "id=:pid");
    $conds = implode(" AND ", $conds);

    $params = $types[$type][1];
    $params["pid"]=$pid;

    debug($conds."<br/>".json_encode($params)."<br/>");

    $enb = req("DELETE FROM $type WHERE $conds", $params)[1];

    if ($enb > 0) {
        ok();
    } else {
        err("unknown_error", "Unknown Error", 500);
    }
}





else if ($a == "addclient") {
    $uid = vtki($tk);

    [$r, $enb, $cid] = req("INSERT INTO clients (user_id) VALUES (:uid)", array(
        "uid"=> $uid
    ));

    if ($cid !== null) {
        ok(array(
            "client_id"=> $cid
        ));
    } else {
        err("unknown_error", "Unknown Error", 500);
    }
}



else if (false && $a == "pass") {
    //[$pass, $user] = mdtpi(["pass", "user"]);

    $h = password_hash("password", PASSWORD_DEFAULT);

    req("UPDATE users SET password=:pw WHERE username='trickish'", array("pw"=>$h));

    ok(array(
        "hash"=> $h
    ));
}


err("unknown_endpoint", "The '".$a."' endpoint is unknown", 501);

?>