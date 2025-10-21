from playwright.sync_api import sync_playwright
from datetime import datetime
import re
import mysql.connector
import time
import sys
from prettytable import PrettyTable

def create_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root',
            database='db_helpti',
            port=3306,
            auth_plugin='mysql_native_password'
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Erro de conexão MySQL: {err}")
        return None

def fetch_dynamic_table_data(page):
    try:
        table = page.wait_for_selector(
            'table#portlet_filha_2517_61965_pageVisualiza_grid_DXMainTable',
            state="attached",
            timeout=45000
        )
        
        data = []
        rows = table.query_selector_all('tr[id^="portlet_filha_2517_61965_pageVisualiza_grid_DXDataRow"]')
        
        for row in rows:
            try:
                cols = row.query_selector_all('td.dxgv')
                if len(cols) < 7:
                    continue
                    
                row_data = {
                    'cd_os': cols[0].inner_text().strip(),
                    'solicitacao': cols[1].inner_text().strip(),
                    'previsao': cols[2].inner_text().strip(),
                    'servico_sol': cols[3].inner_text().strip(),
                    'setor_sol': cols[4].inner_text().strip(),
                    'solicitante': cols[5].inner_text().strip(),
                    'atend_dia': cols[6].inner_text().strip()
                }
                
                row_data = process_row_data(row_data)
                data.append(row_data)
                
            except Exception as e:
                print(f"Erro ao processar linha: {e}")
                continue
        
        return data
        
    except Exception as e:
        print(f"Erro durante a extração: {e}")
        page.screenshot(path='scraping_error.png')
        raise

def process_row_data(row_data):
    if "GARDEN/PERES" in row_data['atend_dia']:
        row_data['atend_dia'] = ""

    try:
        dt = datetime.strptime(row_data['solicitacao'], "%d/%m/%y %H:%M")
        row_data['solicitacao'] = dt.strftime("%Y-%m-%d %H:%M:%S")
    except ValueError as e:
        print(f"Erro ao formatar a data: {e}")

    try:
        dt_obj = datetime.strptime(row_data['solicitacao'], "%Y-%m-%d %H:%M:%S")
        dia_da_semana = dt_obj.weekday()
        dia_do_ano = (dt_obj - datetime(dt_obj.year, 1, 1)).days + 1
        
        palavras_proibidas = [
            "TONNER", "toner", "tuner", "tunner", "tonner",
            "TOWNER", "TOWNE", "TORNER", "TORNE", 
            "CARTUCHO", "CATUCHO", "CARTUXO", 
            "colorida", "coloridas", "color", 
            "camera", "cameras"
        ]
        
        padrao = r'\b(?:' + '|'.join(map(re.escape, palavras_proibidas)) + r')\b'
        
        if not row_data['atend_dia'] and not re.search(padrao, row_data['servico_sol'], re.IGNORECASE):
            if dia_da_semana >= 5:
                row_data['atend_dia'] = "MARCOS, WESLLEY" if (dia_do_ano % 2 == 0) else "KAUA, SARA"
    
    except Exception as e:
        print(f"Erro no processamento de datas: {e}")
    
    return row_data

def check_and_update_data(connection, data):
    cursor = connection.cursor(dictionary=True)
    updated_data = []

    for row in data:
        cursor.execute("SELECT * FROM tb_top_rank WHERE cd_os = %s", (row['cd_os'],))
        existing_row = cursor.fetchone()

        if existing_row:
            if any(existing_row[field] != row[field] for field in row if field != 'cd_os'):
                updated_data.append(row)
        else:
            updated_data.append(row)

    cursor.close()
    return updated_data

def insert_data(data):
    connection = create_connection()
    if not connection:
        return

    try:
        updated_data = check_and_update_data(connection, data)
        if not updated_data:
            return

        cursor = connection.cursor()

        sql_insert_query = """
        INSERT INTO tb_top_rank (cd_os, solicitacao, previsao, servico_sol, setor_sol, solicitante, atend_dia)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
        solicitacao = VALUES(solicitacao),
        previsao = VALUES(previsao),
        servico_sol = VALUES(servico_sol),
        setor_sol = VALUES(setor_sol),
        solicitante = VALUES(solicitante),
        atend_dia = VALUES(atend_dia),
        timestamp = CURRENT_TIMESTAMP
        """
        
        cursor.execute("TRUNCATE TABLE tb_manu_compara")
        
        for row in updated_data:
            cursor.execute(sql_insert_query, (
                row['cd_os'], row['solicitacao'], row['previsao'], 
                row['servico_sol'], row['setor_sol'], 
                row['solicitante'], row['atend_dia']
            ))
            
            cursor.execute("""
            INSERT INTO tb_manu_compara 
            (cd_os_manu_compara, solicitacao_manu_compara, previsao_manu_compara, 
             servico_sol_manu_compara, setor_sol_manu_compara, 
             solicitante_manu_compara, atend_dia_manu_compara)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                row['cd_os'], row['solicitacao'], row['previsao'], 
                row['servico_sol'], row['setor_sol'], 
                row['solicitante'], row['atend_dia']
            ))

        connection.commit()

    except mysql.connector.Error as error:
        print(f"Erro no banco de dados: {error}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def main_loop():
    with sync_playwright() as p:
        while True:
            try:
                # Configuração para execução em segundo plano
                browser = p.chromium.launch(
                    headless=True,  # AGORA ESTÁ EM MODO HEADLESS
                    timeout=60000,
                    args=[
                        '--disable-gpu',
                        '--disable-dev-shm-usage',
                        '--no-sandbox',
                        '--disable-extensions',
                        '--mute-audio',
                        '--window-size=1920,1080',
                        '--start-maximized'
                    ],
                    chromium_sandbox=False
                )
                
                context = browser.new_context(
                    viewport={'width': 1920, 'height': 1080},
                    user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                )
                
                page = context.new_page()
                
                print("Acessando sistema...")
                page.goto(
                    'http://200.155.115.161:8081/PAINEL/ACCOUNT/LOGIN_NEW.ASPX?chave=Lz60TZqzQj7TTfHZn%2ffTqx%2b78Fa%2f3inndN%2beqM%2b7Tj8APynT9RibM4zkjvDyMtRG51NjA7ZiHqJ5NSv91fitWw%3d%3d',
                    timeout=60000,
                    wait_until="domcontentloaded"
                )
                
                page.goto(
                    'http://200.155.115.161:8081/Painel/Portlets/portlet_frame.aspx?CdPlanilha=0&CdPortlet=2517&CdPortletConfig=61965&pTipoPortlet=SQL&ExibirPrompt=false&ExistePrompt=false&PromptRespondido=false&LinhasPorPaginaConfigPortal=50&Height=724&Width=1517&IsConfirmacao=N&isAtualizacao=S',
                    timeout=60000,
                    wait_until="networkidle"
                )
                
                last_count = 0
                while True:
                    try:
                        print("Verificando novos dados...")
                        data = fetch_dynamic_table_data(page)
                        
                        if data:
                            print(f"Encontrados {len(data)} registros")
                            if len(data) != last_count:
                                insert_data(data)
                                last_count = len(data)
                            else:
                                print("Nenhuma alteração detectada")
                        
                        time.sleep(12)
                        
                        if len(data) > 0 and int(datetime.now().strftime('%M')) % 5 == 0:
                            page.reload()
                            time.sleep(5)
                            
                    except Exception as e:
                        print(f"Erro no loop de verificação: {e}")
                        page.screenshot(path='loop_error.png')
                        break
                
            except Exception as e:
                print(f"Erro principal: {e}")
            finally:
                if 'browser' in locals():
                    browser.close()
                time.sleep(10)

if __name__ == "__main__":
    try:
        # Verifica a conexão com o banco primeiro
        test_conn = create_connection()
        if test_conn:
            print("Conexão com o banco OK. Iniciando monitoramento...")
            test_conn.close()
            main_loop()
        else:
            print("Falha na conexão com o banco de dados")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\nScript encerrado pelo usuário")
        sys.exit(0)