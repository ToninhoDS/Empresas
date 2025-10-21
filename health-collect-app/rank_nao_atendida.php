<?php
session_start();

include __DIR__ . '/../../autentica/conexao.php';

$login_user = $_SESSION['username'];

// Verificar se o usuário está logado
if (!isset($_SESSION['username'])) {
    // Redirecionar de volta para a página de login ou qualquer outra página desejada
    header('Location: /hmg/manu/login.php');
    exit(); // Encerrar o script após redirecionar
}

// Verificar se o usuário já foi registrado como visitante
if (!isset($_SESSION['visitante_registrado'])) {
    // Buscar dados do usuário logado
    $sql = "SELECT cd_login_contato, nm_nome, nm_img, cd_funcao FROM tb_login_contato WHERE nm_usuario = :username";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $login_user, PDO::PARAM_STR);
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($usuario) {
        // Inserir visita na tabela visitante_manu_ajuda
        $sql_insert = "INSERT INTO visitante_manu_ajuda (id_login_contato, nm_nome, cd_funcao, nm_img, data_hora) VALUES (:id_login_contato, :nm_nome, :cd_funcao, :nm_img, NOW())";
        $stmt_insert = $conn->prepare($sql_insert);
        $stmt_insert->bindParam(':id_login_contato', $usuario['cd_login_contato'], PDO::PARAM_INT);
        $stmt_insert->bindParam(':nm_nome', $usuario['nm_nome'], PDO::PARAM_STR);
        $stmt_insert->bindParam(':cd_funcao', $usuario['cd_funcao'], PDO::PARAM_STR);
        $stmt_insert->bindParam(':nm_img', $usuario['nm_img'], PDO::PARAM_STR);
        $stmt_insert->execute();

        // Marcar na sessão que o usuário já foi registrado como visitante
        $_SESSION['visitante_registrado'] = true;
    }
}

// Buscar dados do usuário logado novamente
$sql = "SELECT cd_login_contato, nm_nome, nm_img, cd_funcao FROM tb_login_contato WHERE nm_usuario = :username";
$stmt = $conn->prepare($sql);
$stmt->bindParam(':username', $login_user, PDO::PARAM_STR);
$stmt->execute();
$usuario = $stmt->fetch(PDO::FETCH_ASSOC);
$nome = $usuario['nm_nome'];
$img_visitante = $usuario['nm_img'];
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="30" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mantenção TI</title>
  <link rel="shortcut icon" href="/hmg/manu/assets/images/img_corpo/img-manu-sem-icon.ico" type="image/x-icon">
  <link rel="stylesheet" href="/hmg/manu/assets/css/style.css">
  <link rel="stylesheet" href="/hmg/manu/assets/css/corpo_topico.css">
  <link rel="stylesheet" href="/hmg/manu/assets/css/corpo_modal.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  <script src="/hmg/manu/assets/js/inativo_pg.js"></script>
</head>

<body>

  <!--
    - #MAIN
  -->

  <main>

    <!--
      - #SIDEBAR
    -->

    <aside class="sidebar" data-sidebar>
      
      <div class="sidebar-info">

        <figure class="avatar-box">
          <img style="border-radius: 8px 35px 8px 8px;" src="/hmg/manu/assets/images/user_login/<?php echo $img_visitante; ?>" alt="Avatar" width="80">
        </figure>

        <div class="info-content">
          <h1 class="name nome_visitante" title="Richard hanrick"><?php echo $nome; ?></h1>   
            <a href="/hmg/manu/corpo/home.php">
              <button class="title"><h2>Voltar</h2></button>
            </a>
        </div>

        <button class="info_more-btn" data-sidebar-btn>
          <span>Principais Assuntos</span>
          <ion-icon name="chevron-down"></ion-icon>
        </button>

      </div>

      <div class="sidebar-info_more">

        <div class="separator"></div>

        <ul class="contacts-list">
          <li class="contact-item">
            <div class="contact-info">
              <p class="contact-title">Ordem de Serviço</p>
              <a href="/hmg/manu/corpo/topicos/rank_nao_atendida.php" class="contact-link">Novas Solicitações</a>
            </div>
          </li>
          <li class="contact-item">
            <div class="contact-info">
              <p class="contact-title">Top Rank</p>
              <a href="/hmg/manu/corpo/topicos/rank_acma.php" class="contact-link">Rank T.I.</a>
            </div>
          </li>
          <li class="contact-item">
            <div class="contact-info">
              <p class="contact-title">Mapeamento</p>
              <a href="/hmg/manu/corpo/topicos/mapeamento.php" class="contact-link">All</a>
            </div>
          </li>
          <li class="contact-item">
            <div class="contact-info">
              <p class="contact-title">CMD de Limpeza</p>
              <a href="/hmg/manu/corpo/topicos/cmd_limpeza.php" class="contact-link">CHKDSK e outros</a>
            </div>
          </li>
          <li class="contact-item">
            <div class="contact-info">
              <p class="contact-title">Inventário</p>
              <a href="/hmg/manu/corpo/topicos/invenrario_impressoras.php" class="contact-link">Impressoras</a>
              <a href="/hmg/manu/corpo/topicos/inventario_pc.php" class="contact-link">PC</a>
            </div>
          </li>
          <li class="contact-item">
            <div class="contact-info">
              <p class="contact-title">Endereços IP</p>
              <a href="/hmg/manu/corpo/topicos/ip-em-uso.php" class="contact-link">IPs disponíveis</a>
            </div>
          </li>
        </ul>

        <div class="separator"></div>

        <ul class="social-list">
          <li class="social-item">
            <div class="info-content">
              <a href="/hmg/manu/autentica/logout.php">
                <p style="font-size: 20px;" class="title next-social-list">
                  <i class="fa fa-sign-out" aria-hidden="true"></i>
                  Logout
                </p>
              </a>
            </div>
          </li>
        </ul>

      </div>

    </aside>

    <!--
      - #main-content
    -->

    <div class="main-content">

      <!--
        - #NAVBAR
      -->

      <nav class="navbar">

        <ul class="navbar-list">

        <li class="navbar-item">
            <a href='/hmg/manu/corpo/topicos/rank_nao_atendida.php'>
            <button class="navbar-link active" data-nav-link>OS ON</button></a>
          </li>
          <li class="navbar-item">
            <a href='/hmg/manu/corpo/topicos/rank_acma.php'>
            <button class="navbar-link " data-nav-link>Best Dia</button></a>
          </li>

          <li class="navbar-item">
            <a href='/hmg/manu/corpo/topicos/rank-mes.php'>
              <button class="navbar-link" data-nav-link>Best Mês</button>
            </a>
          </li>

          <li class="navbar-item">
            <a href='/hmg/manu/corpo/topicos/rank-ano.php'>
              <button class="navbar-link" data-nav-link>Best Ano</button>
            </a>
          </li>

          <li class="navbar-item">
            <a href='/hmg/manu/corpo/topicos/rank_seletor.php'>
              <button class="navbar-link" data-nav-link>Tags</button>
            </a>
          </li>

          <li class="navbar-item">
            <a href='/hmg/manu/corpo/topicos/rank-gao_mestre.php'>
              <button class="navbar-link" data-nav-link>Grão Mestre</button>
            </a>
          </li>

        </ul>

      </nav>

      <article class="about active" data-page="home">
<br>
<br>
<?php

// Conexão com o banco de dados
// Excluir registros onde "setor_sol" contém "toner", "tonner", etc.
$Sem_atendimento = ''; // ou NULL se estiver nulo no banco
$sql_sem_atendimento = "
SELECT
servico_sol, cd_os, setor_sol, solicitante, solicitacao, timestamp
FROM
tb_top_rank tr
WHERE
atend_dia = :Sem_atendimento
AND LOWER(servico_sol) NOT LIKE '%toner%'
AND LOWER(servico_sol) NOT LIKE '%tuner%'
AND LOWER(servico_sol) NOT LIKE '%tunner%'
AND LOWER(servico_sol) NOT LIKE '%tonner%'
AND LOWER(servico_sol) NOT LIKE '%TOWNER%'
AND LOWER(servico_sol) NOT LIKE '%TOWNE%'
AND LOWER(servico_sol) NOT LIKE '%TOWNER%'
AND LOWER(servico_sol) NOT LIKE '%TORNER%'
AND LOWER(servico_sol) NOT LIKE '%TORNE%'
AND LOWER(servico_sol) NOT LIKE '%CARTUCHO%'
AND LOWER(servico_sol) NOT LIKE '%CATUCHO%'
AND LOWER(servico_sol) NOT LIKE '%CARTUXO%'
AND LOWER(servico_sol) NOT LIKE '%colorida%'
AND LOWER(servico_sol) NOT LIKE '%coloridas%'
AND LOWER(servico_sol) NOT LIKE '%impressão color%'
AND LOWER(servico_sol) NOT LIKE '%TELEVISÃO%'
AND LOWER(servico_sol) NOT LIKE '%TELEVISAO%'
AND LOWER(servico_sol) NOT LIKE '%camera%'
AND LOWER(servico_sol) NOT LIKE '%cameras%'
AND LOWER(servico_sol) NOT LIKE '%TV%'
AND LOWER(servico_sol) NOT LIKE '%TVS%'
AND DATE_FORMAT(solicitacao, '%Y-%m-%d') = CURDATE()
AND EXISTS (
SELECT 1
FROM tb_manu_compara mc
WHERE mc.cd_os_manu_compara = tr.cd_os
)
ORDER BY
solicitacao ASC"; // Ordena da mais antiga para a mais recente

$stmt_sem_atendimento = $conn->prepare($sql_sem_atendimento);
$stmt_sem_atendimento->bindParam(':Sem_atendimento', $Sem_atendimento, PDO::PARAM_STR);
$stmt_sem_atendimento->execute();
$result_sem_atendimento = $stmt_sem_atendimento->fetchAll(PDO::FETCH_ASSOC);



?>
<header>
    <h2 class="h2 article-title">
        O.S. Sem Entrada - <strong style='color: goldenrod'>Hoje</strong>
    </h2>
    <p class="timeline-text">🕔 <?php 
        if (!empty($result_sem_atendimento[0]['timestamp'])) {
            echo date('H:i:s - d/m/y', strtotime($result_sem_atendimento[0]['timestamp']));
        } else {
            echo 'N/A';
        }
        ?></p>
</header>

<?php
if ($stmt_sem_atendimento->rowCount() > 0) {
    echo "<table class='table_OS_sem_entrada'>
            <thead>
                <tr>
                    <th>Hora</th>
                    <th>Setor Solicitante</th>
                    <th>Serviço Solicitado</th>
                    <th>Solicitante</th>
                </tr>
            </thead>
            <tbody>";

    foreach ($result_sem_atendimento as $row) {
        $data_solicitacao = strtotime($row['solicitacao']);
        $hora = date('H:i', $data_solicitacao);
        $dia_mes = date('d/m', $data_solicitacao);

        // Adicione um atributo data para armazenar os dados adicionais para o modal
        echo "<tr class='open-modal' data-hora='" . htmlspecialchars($hora) . "' 
                        data-setor='" . htmlspecialchars($row['setor_sol']) . "' 
                        data-os='" . htmlspecialchars($row['cd_os']) . "' 
                        data-servico='" . htmlspecialchars($row['servico_sol']) . "' 
                        data-solicitante='" . htmlspecialchars($row['solicitante']) . "'>
                <td>" . htmlspecialchars($hora) . "</td>
                <td>" . htmlspecialchars($row['setor_sol']) . "</td>
                <td>" . htmlspecialchars($row['servico_sol']) . "</td>
                <td>" . htmlspecialchars($row['solicitante']) . "</td>
              </tr>";
    }

    echo "</tbody></table>
    <p class='timeline-text'> 
      <strong style='color: goldenrod'>Clique na OS </strong>para mais detalhes<br><strong  style='color: goldenrod'>Para Enviar os dados da OS</strong> clique no icone do <strong>Whatsapp  <i style='font-size:24px;color:green' class='fa'>&#xf232;</i>
      </strong>
    </p>
    <p>
      <div class='info-content' style='float: left; padding:5px 0  5px 0'> 
        <a href='/hmg/manu/corpo/topicos/ordem_servico.php'>
          <button class='title'><h2><strong style='color: goldenrod'>
            Ver todas as Ordem de Serviços &nbsp;<i class='fa fa-sign-out' aria-hidden='true'></i>
          </strong></h2></button>
        </a>
      </div>
    </p><br>";
?>
<br>
<li class="">
        <h5 class="h4 timeline-item-title">Ordem de Serviço que <strong>NÃO SERÃO EXIBIDAS:</strong></h5>
          <p class="timeline-text">
            - <strong>Tonner</strong><br>
            - <strong>Impressão colorida</strong><br>
            - <strong>Câmera</strong><br>
            - <strong>Telefonia</strong><br>
            - <strong>Tv</strong>
          </p>
    </li>
<?php
} else {
    echo "<table class='table_OS_sem_entrada'>
            <thead>
                <tr>
                    <th>Hora</th>
                    <th>Setor Solicitante</th>
                    <th>Serviço Solicitado</th>
                    <th>Solicitante</th>
                </tr>
            </thead>
            <tbody><br>";
    echo "<p class='timeline-text'>TODAS AS ORDENS DE SERVIÇOS ESTÃO EM <strong style='color: goldenrod'>ATENDIMENTO.</stron></p>";
    echo "<p>
          <div class='info-content' style='float: left; padding:5px 0  5px 0'> 
              <a href='/hmg/manu/corpo/topicos/ordem_servico.php'>
                <button class='title'><h2><strong style='color: goldenrod'>
                  Ver todas as Ordem de Serviços &nbsp;<i class='fa fa-sign-out' aria-hidden='true'></i>
                </strong></h2></button>
              </a>
          </div>
    </p><br>";
}
?>

<!-- Modal HTML -->
<div id="detalhesModal" class="modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2>Detalhes da OS</h2>
    <!-- Agrupe OS e Hora dentro de um div com estilo flex -->
    <div class="os-hora">
      <p><strong>OS:</strong> <span id="modalOS"></span></p>
      <p><strong>Hora:</strong> <span id="modalHora"></span></p>
    </div>
    <p><strong>Setor Solicitante:</strong> <span id="modalSetor"></span></p>
    <p><strong>Serviço Solicitado:</strong> <span id="modalServico"></span></p>
    <p><strong>Solicitante:</strong> <span id="modalSolicitante"></span></p>
    <a href="#" id="whatsappBtn" class="whatsapp-float" target="_blank">
    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" width="50" height="50">
</a>
  </div>
</div>
    <!-- </ul> -->
</section>
<!-- fim do rank -->  
      </article>

  </div> 
    <!-- FIM -->
</main>

  <!--
    - custom js link
  -->
  <script src="/hmg/manu/assets/js/script.js"></script>
  <script src="/hmg/manu/assets/js/modal_whatz.js"></script>

  <!--
    - ionicon link
  -->
  <script type="module" src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
  <script nomodule src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>

</body>

</html>
