
import mysql.connector
from flask import jsonify

def create_connection():
    """Create a connection to the MySQL database"""
    try:
        connection = mysql.connector.connect(
            host='172.16.0.39',
            user='dbati',
            password='info@1543',
            database='homologacao',
            port=3306,
            auth_plugin='mysql_native_password'
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Erro de conexão MySQL: {err}")
        return None

def execute_query(query, params=None, dictionary=True):
    """Execute a query and return the results"""
    connection = create_connection()
    if not connection:
        return None, "Falha na conexão com o banco de dados"
    
    try:
        cursor = connection.cursor(dictionary=dictionary)
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        result = cursor.fetchall()
        return result, None
    except Exception as e:
        print(f"Erro ao executar query: {str(e)}")
        return None, str(e)
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
