// Foi realizado algumas modificações neste código, mas o código original é de https://github.com/jamiewilson/from-to-google-sheets

// Configuração global
const CONFIG = {
  NOME_ABA: "Formulário",
  COLUNA_DATA: "Data_Hora",
  CAMPOS_OBRIGATORIOS: ['Nome', "Email", "Telefone", "Mensagem"]
}
const propScript = PropertiesService.getScriptProperties(); // Armazenando a propriedade do script

function setupInicial(){
  /**
   * Configurando automaticamente o ID da planilha caso não exista
   */

  
  if(!propScript.getProperty('key')){
    const planilhaAtiva = SpreadsheetApp.getActiveSpreadsheet(); // Defininido a planilha ativa
    propScript.setProperty('key', planilhaAtiva.getId());
  }
}

function doPost(e){
  /**
   * Processamento de postagens
   */

  // Evitando execuções simultâneas
  const bloqueio = LockService.getScriptLock();

  try{
    bloqueio.tryLock(15000); // Tentando bloquear por 15 segundos

    // Acessando a planilha pelo ID armazenado
    const doc = SpreadsheetApp.openById(propScript.getProperty('key'));
    // Obtendo a aba pelo nome
    const sheet = doc.getSheetByName(CONFIG.NOME_ABA);
    if(!sheet) throw new Error('Planilha não encontrada'); // Verificando se a planilha existe

    // Obtendo o cabeçalho da primeira linha
    const cabecalho = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const proxLinha = sheet.getLastRow() + 1; // Obtendo a proxima linha vazia

    // Verificando campos obrigatórios
    const campoFaltante = CONFIG.CAMPOS_OBRIGATORIOS.filter(
      campo => !e.parametro[campo]?.trim() // ?.trim() Segurança contra undefined. Em vez de gerar erro irá gerar 'undefined'
    );
    if(campoFaltante.length > 0){
      throw new Error(`Campos obrigatórios faltantes: ${campoFaltante.join(', ')}`);
    }

    // Construção dos dados
    // Mapeando cabeçalho para receber seu valor
    const novosDados = cabecalho.map(header => {
      return header === CONFIG.COLUNA_DATA ? new Date() : e.parametro[header]?.trim() || '';
    })

    Logger.log(novosDados)

  }catch (error){
    // Log interno
    console.error('Erro no processamento: ', error);

    // Retornando resposta de erro
    return buildResponse({
      success: false,
      error: 'Erro no processamento'
    });

  }finally {
    // Liberando o bloqueio
    bloqueio.releaseLock();
  }
}

function buildResponse(data){
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function teste(){
  const ex = {
    parametro: {
      'Nome': 'Felipe',
      'Email': 'felipe@gmail.com',
      'Telefone': '11987654321',
      'Mensagem': 'Olá, Me chamo Felipe Tamura e gostaria de entrar em contato sobre a vaga de dev Junior',
    }
  }
  
  doPost(ex);
}