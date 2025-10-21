
from datetime import datetime

def format_date(date_str):
    """Format date strings consistently for API responses"""
    if not date_str or str(date_str).strip() == '':
        return None
    try:
        # Se já for um objeto datetime, retorna direto
        if isinstance(date_str, datetime):
            return date_str.isoformat()
        
        # Tenta converter do formato brasileiro (DD/MM/YY HH:mm)
        try:
            return datetime.strptime(str(date_str), '%d/%m/%y %H:%M').isoformat()
        except ValueError:
            # Se falhar, tenta o formato padrão
            return datetime.strptime(str(date_str), '%Y-%m-%d %H:%M:%S').isoformat()
    except Exception as e:
        print(f"Erro ao formatar data {date_str}: {str(e)}")
        return None
