
from flask import jsonify, Blueprint
from src.api.database import execute_query
from src.api.utils import format_date

# Create a Blueprint for service orders routes
service_orders_bp = Blueprint('service_orders', __name__)

@service_orders_bp.route('/api/service-orders', methods=['GET'])
def get_service_orders():
    query = """
        SELECT 
            id_top_rank,
            cd_os,
            solicitacao,
            previsao,
            servico_sol,
            setor_sol,
            solicitante,
            sit,
            TIMESTAMPDIFF(DAY, solicitacao, NOW()) as dias,
            atend_dia,
            CASE 
                WHEN sit = 'Concluída' THEN 'Concluída'
                ELSE 'Pendente'
            END as status,
            servico_sol as descricao,
            timestamp
        FROM tb_top_rank tr
        WHERE EXISTS (
            SELECT 1
            FROM tb_manu_compara mc
            WHERE mc.cd_os_manu_compara = tr.cd_os
        )
        ORDER BY solicitacao DESC
    """
    
    service_orders, error = execute_query(query)
    if error:
        return jsonify({"error": error}), 500
    
    # Format dates for JSON response
    for order in service_orders:
        order['solicitacao'] = format_date(order['solicitacao'])
        order['previsao'] = format_date(order['previsao'])
        order['timestamp'] = format_date(order['timestamp'])
    
    return jsonify(service_orders)

@service_orders_bp.route('/api/service-orders/technician/<technician>', methods=['GET'])
def get_service_orders_by_technician(technician):
    if technician == 'TODOS':
        query = """
            SELECT 
                id_top_rank,
                cd_os,
                solicitacao,
                previsao,
                servico_sol,
                setor_sol,
                solicitante,
                sit,
                TIMESTAMPDIFF(DAY, solicitacao, NOW()) as dias,
                atend_dia,
                CASE 
                    WHEN sit = 'Concluída' THEN 'Concluída'
                    ELSE 'Pendente'
                END as status,
                servico_sol as descricao,
                timestamp
            FROM tb_top_rank tr
            WHERE EXISTS (
                SELECT 1
                FROM tb_manu_compara mc
                WHERE mc.cd_os_manu_compara = tr.cd_os
            )
            ORDER BY solicitacao DESC
        """
        service_orders, error = execute_query(query)
    else:
        query = """
            SELECT 
                id_top_rank,
                cd_os,
                solicitacao,
                previsao,
                servico_sol,
                setor_sol,
                solicitante,
                sit,
                TIMESTAMPDIFF(DAY, solicitacao, NOW()) as dias,
                atend_dia,
                CASE 
                    WHEN sit = 'Concluída' THEN 'Concluída'
                    ELSE 'Pendente'
                END as status,
                servico_sol as descricao,
                timestamp
            FROM tb_top_rank tr
            WHERE atend_dia = %s
            AND EXISTS (
                SELECT 1
                FROM tb_manu_compara mc
                WHERE mc.cd_os_manu_compara = tr.cd_os
            )
            ORDER BY solicitacao DESC
        """
        service_orders, error = execute_query(query, (technician,))
    
    if error:
        return jsonify({"error": error}), 500
    
    # Format dates for JSON response
    for order in service_orders:
        order['solicitacao'] = format_date(order['solicitacao'])
        order['previsao'] = format_date(order['previsao'])
        order['timestamp'] = format_date(order['timestamp'])
    
    return jsonify(service_orders)

@service_orders_bp.route('/api/service-orders/status/<status>', methods=['GET'])
def get_service_orders_by_status(status):
    query = """
        SELECT 
            id_top_rank,
            cd_os,
            solicitacao,
            previsao,
            servico_sol,
            setor_sol,
            solicitante,
            sit,
            TIMESTAMPDIFF(DAY, solicitacao, NOW()) as dias,
            atend_dia,
            CASE 
                WHEN sit = 'Concluída' THEN 'Concluída'
                ELSE 'Pendente'
            END as status,
            servico_sol as descricao,
            timestamp
        FROM tb_top_rank tr
        WHERE sit = %s
        AND EXISTS (
            SELECT 1
            FROM tb_manu_compara mc
            WHERE mc.cd_os_manu_compara = tr.cd_os
        )
        ORDER BY solicitacao DESC
    """
    
    service_orders, error = execute_query(query, (status,))
    if error:
        return jsonify({"error": error}), 500
    
    # Format dates for JSON response
    for order in service_orders:
        order['solicitacao'] = format_date(order['solicitacao'])
        order['previsao'] = format_date(order['previsao'])
        order['timestamp'] = format_date(order['timestamp'])
    
    return jsonify(service_orders)

@service_orders_bp.route('/api/service-orders/new', methods=['GET'])
def get_new_service_orders():
    query = """
        SELECT 
            id_top_rank,
            cd_os,
            solicitacao,
            previsao,
            servico_sol,
            setor_sol,
            solicitante,
            sit,
            TIMESTAMPDIFF(DAY, solicitacao, NOW()) as dias,
            atend_dia,
            CASE 
                WHEN sit = 'Concluída' THEN 'Concluída'
                ELSE 'Pendente'
            END as status,
            servico_sol as descricao,
            timestamp
        FROM tb_top_rank tr
        WHERE atend_dia = ''
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
        ORDER BY solicitacao ASC
    """
    
    service_orders, error = execute_query(query)
    if error:
        return jsonify({"error": error}), 500
    
    # Format dates for JSON response
    for order in service_orders:
        order['solicitacao'] = format_date(order['solicitacao'])
        order['previsao'] = format_date(order['previsao'])
        order['timestamp'] = format_date(order['timestamp'])
    
    return jsonify(service_orders)

@service_orders_bp.route('/api/service-orders/today', methods=['GET'])
def get_today_service_orders():
    query = """
        SELECT 
            id_top_rank,
            cd_os,
            solicitacao,
            previsao,
            servico_sol,
            setor_sol,
            solicitante,
            sit,
            TIMESTAMPDIFF(DAY, solicitacao, NOW()) as dias,
            atend_dia,
            CASE 
                WHEN sit = 'Concluída' THEN 'Concluída'
                ELSE 'Pendente'
            END as status,
            servico_sol as descricao,
            timestamp
        FROM tb_top_rank tr
        WHERE DATE_FORMAT(solicitacao, '%Y-%m-%d') = CURDATE()
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
        AND EXISTS (
            SELECT 1
            FROM tb_manu_compara mc
            WHERE mc.cd_os_manu_compara = tr.cd_os
        )
        ORDER BY solicitacao ASC
    """
    
    service_orders, error = execute_query(query)
    if error:
        return jsonify({"error": error}), 500
    
    # Format dates for JSON response
    for order in service_orders:
        order['solicitacao'] = format_date(order['solicitacao'])
        order['previsao'] = format_date(order['previsao'])
        order['timestamp'] = format_date(order['timestamp'])
    
    return jsonify(service_orders)

@service_orders_bp.route('/api/service-orders/pending', methods=['GET'])
def get_pending_service_orders():
    query = """
        SELECT 
            id_top_rank,
            cd_os,
            solicitacao,
            previsao,
            servico_sol,
            setor_sol,
            solicitante,
            sit,
            TIMESTAMPDIFF(DAY, solicitacao, NOW()) as dias,
            atend_dia,
            CASE 
                WHEN sit = 'Concluída' THEN 'Concluída'
                ELSE 'Pendente'
            END as status,
            servico_sol as descricao,
            timestamp
        FROM tb_top_rank tr
        WHERE (atend_dia IS NULL OR atend_dia = '')
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
        AND EXISTS (
            SELECT 1
            FROM tb_manu_compara mc
            WHERE mc.cd_os_manu_compara = tr.cd_os
        )
        ORDER BY solicitacao ASC
    """
    
    service_orders, error = execute_query(query)
    if error:
        return jsonify({"error": error}), 500
    
    # Format dates for JSON response
    for order in service_orders:
        order['solicitacao'] = format_date(order['solicitacao'])
        order['previsao'] = format_date(order['previsao'])
        order['timestamp'] = format_date(order['timestamp'])
    
    return jsonify(service_orders)
