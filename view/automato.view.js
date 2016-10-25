
var AutomatoView = Backbone.View.extend({

    tagName: 'table',
    className: 'tabela-automato',

    events : {
      "change .js-input-nome-estado": "mudarNomeEstado",
      "change .js-select-transicao": "mudarTransicao",
      "click .js-checkbox-final": "mudarEstadoFinal",
      "click .js-radio-inicial": "mudarEstadoInicial",
      "change .js-input-nome-terminal": "mudarNomeTerminal"
    },

    initialize: function(options) {
      this.estados = options.estados;
      this.alfabeto = options.alfabeto;
      this.elemento = options.elGrafo;
      // pegar o ultimo estado, e retirar a parte que não é um inteiro: 'q';
      this.indexEstado = parseInt(Object.keys(options.estados)[Object.keys(options.estados).length - 1].replace ( /[^\d.]/g, '' ));
      this.listaDeLetras = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','x','w','y','z'];
    },

    gerarTabela: function() {
      var header = this.gerarHeader();
      this.$el.append(header);
      var linhas = this.gerarLinhas();
      this.$el.append(linhas);
    },

    gerarTabelaDinamica: function() {
      this.$el.html('');
      var header = this.gerarHeaderDinamico();
      this.$el.append(header);
      var linhas = this.gerarLinhasDinamicas();
      this.$el.append(linhas);
    },

    gerarHeader: function() {
      var colunas = '<th class="coluna-nome" >d</th>';
      for (var i = 0; i < this.alfabeto.length; i++) {
        colunas += '<th>'+this.alfabeto[i]+'</th>';
      }
      return '<tr>'+colunas+'</tr>';
    },

    gerarHeaderDinamico: function() {
      var colunas = '<th class="coluna-nome coluna-inicio" >inicial</th>';
      colunas += '<th class="coluna-nome coluna-final" >final</th>';
      colunas += '<th class="coluna-nome" >d</th>';
      for (var i = 0; i < this.alfabeto.length; i++) {
        colunas += '<th><input type="text" class="js-input-nome-terminal" data-ultimo="'+this.alfabeto[i]+'"  maxlength="1" style="width:25px;" value='+this.alfabeto[i]+'></td></th>';
      }
      return '<tr>'+colunas+'</tr>';
    },

    gerarLinhas: function() {
      var linhas;
      console.log(this.estados)
      for (var estado in this.estados) {
        estado = this.estados[estado];
        var inicial = (estado.inicial)? '->' : '';
        var final = (estado.final)? '*' : '';
        var celulas = '<td class="coluna-nome" >'+inicial+final+estado.nome+'</td>';
        for (var transicao in estado.transicoes) {
          transicao = estado.transicoes[transicao];
          if (!transicao) transicao = '-';
          celulas += '<td>'+transicao+'</td>';
        }
        linhas += '<tr>'+celulas+'</tr>'
      }
      return linhas;
    },

    gerarLinhasDinamicas: function() {
      var linhas;
      for (var estado in this.estados) {
        estado = this.estados[estado];
        var inicial = (estado.inicial)? 'checked' : '';
        var final = (estado.final)? 'checked' : '';
        var celulas = '<td class="coluna-nome coluna-inicio" ><input type="radio" class="js-radio-inicial" value="'+estado.id+'" name="inicial" '+inicial+'></td>';
        celulas += '<td class="coluna-nome coluna-final" ><input type="checkbox"  class="js-checkbox-final" value="'+estado.id+'" name="final" '+final+'></td>';
        celulas += '<td class="coluna-nome" ><input data-target="'+estado.id+'" type="text" class="js-input-nome-estado" style="width:50px;" value='+estado.nome+'></td>';
        for (var terminal in estado.transicoes) {
          transicao = estado.transicoes[terminal];
          if (!transicao) transicao = '-';
          var options = '';
          for (var estado2 in this.estados) {
            estado2 = this.estados[estado2];
            var selecionado = false;
            if (estado2.id == transicao) {
              selecionado = true
              options += '<option value="'+estado2.id+'" selected>'+estado2.nome+'</option>'  
            } else {
              options += '<option value="'+estado2.id+'">'+estado2.nome+'</option>'
            }
          }
          if (transicao === '-') {
            options += '<option value="false" selected> - </option>' 
          } else {
            options += '<option value="false"> - </option>' 
          }
          celulas += '<td><select data-terminal="'+terminal+'" data-estado="'+estado.id+'" class="js-select-transicao">'+options+'</select></td>';
        }
        linhas += '<tr>'+celulas+'</tr>'
      }
      return linhas;
    },

    mudarNomeEstado: function(event) {
      var id = $(event.currentTarget).data('target');
      var novoNome = $(event.currentTarget).val();
      for (var estado in this.estados) {
        estado = this.estados[estado];
        if (estado.id === id) {
          estado.nome = novoNome;
        }
        for (var transicao in estado.transicoes) {
          transicao = estado.transicoes[transicao];
          if (transicao === id) {
            transicao = novoNome;
          }
        }
      }
      this.gerarTabelaDinamica();
      this.gerarGrafo();
    },

    mudarTransicao: function(event) {
      var sourceId = $(event.currentTarget).data('estado');
      var terminal = $(event.currentTarget).data('terminal');
      var novaTransicao = $(event.currentTarget).val();
      if (novaTransicao === 'false') novaTransicao = false;
      for (var estado in this.estados) {
        estado = this.estados[estado];
        if (estado.id === sourceId) {
          estado.transicoes[terminal] = novaTransicao;
        }
      }
      console.log(this.estados)
      this.gerarTabelaDinamica();
      this.gerarGrafo();
    },

    mudarEstadoFinal: function(event) {
      var id = $(event.currentTarget).val();
      console.log(id)
      console.log($(event.currentTarget).is(":checked"))
      for (var estado in this.estados) {
        estado = this.estados[estado];
        if (estado.id === id) {
          estado.final = $(event.currentTarget).is(":checked");
        }
      }
      this.gerarTabelaDinamica();
      this.gerarGrafo();
    },

    mudarEstadoInicial: function(event) {
      var id = $(event.currentTarget).val();
      for (var estado in this.estados) {
        estado = this.estados[estado];
        if (estado.id === id) {
          estado.inicial = true
        } else {
          estado.inicial = false;
        }
      }
      this.gerarTabelaDinamica();
      this.gerarGrafo();
    },

    mudarNomeTerminal: function(event) {
      var novoNome = $(event.currentTarget).val();
      var ultimoNome = $(event.currentTarget).data('ultimo');

      if (_.contains(this.alfabeto, novoNome)) {
        alert('Nome escolhido já existe!')
        $(event.currentTarget).val(ultimoNome)
        return;
      }

      for (var index in this.alfabeto) {
        var terminal = this.alfabeto[index];
        if (terminal === ultimoNome) {
          this.alfabeto[index] = novoNome;
        }
      }

      for (var estado in this.estados) {
        estado = this.estados[estado];
        var transicoes = {};
        for (var terminal in estado.transicoes) {
          if (terminal === ultimoNome) {
            transicoes[novoNome] = estado.transicoes[terminal];
          } else {
            transicoes[terminal] = estado.transicoes[terminal];
          }
        }
        estado.transicoes = transicoes;
      }
      console.log(this.estados)
      this.gerarTabelaDinamica();
      this.gerarGrafo();
    },

    novoTerminal: function(event) {
      var disponiveis = _.difference(this.listaDeLetras, this.alfabeto);
      var novoTerminal = disponiveis.shift(); 
      this.alfabeto.push(novoTerminal);
      for (var estado in this.estados) {
        estado = this.estados[estado];
        estado.transicoes[novoTerminal] = false;
      }
      this.gerarTabelaDinamica();
      this.gerarGrafo();
    },

    removerTerminal: function() {
      var terminal = this.alfabeto.pop();
      for (var estado in this.estados) {
        estado = this.estados[estado];
        delete estado.transicoes[terminal];
      }
      this.gerarTabelaDinamica();
      this.gerarGrafo();
    },

    novoEstado: function(event) {
      console.log(this.indexEstado)
      var index = ++this.indexEstado;
      var nome = 'q'+index;
      this.estados[nome] = {
          nome: nome,
          id: nome,
          inicial: false,
          final: false,
          transicoes : {}
      };
      
      for (var index in this.alfabeto) {
        var terminal = this.alfabeto[index];
        this.estados[nome].transicoes[terminal] = false;
      }
      this.gerarTabelaDinamica();
      this.gerarGrafo();
    },

    removerEstado: function(event) {
      var keyArray = Object.keys(this.estados);
      var ultimoEstado = keyArray[keyArray.length - 1];
      for (var estado in this.estados) {
        estado = this.estados[estado];
        for (var terminal in estado.transicoes) {
          if (estado.transicoes[terminal] === ultimoEstado) {
            estado.transicoes[terminal] = false;
          }
        }
      }
      delete this.estados[ultimoEstado];
      this.gerarTabelaDinamica();
      this.gerarGrafo();
    },

    gerarGrafo: function() {
        var elemento = this.elemento;
        $('#'+elemento).html('');
        var nodes = [];
        var edges = [];
        var contador = 1;
        for (var estado in this.estados) {
          var coluna = contador % this.alfabeto.length;
          var linha = this.alfabeto.length / contador ;
          contador++;
          estado = this.estados[estado];
          var inicial = (estado.inicial)? '->' : '';
          var borda = (estado.final)? 4 : 0;
          var corBorda = (estado.final)? '#214f77' : '#337ab7';
          nodes.push({"id":estado.id, "label":inicial+estado.nome, "borderWidth":borda, "borderColor":'#214f77', "x":coluna, "y":linha, "size":10});
          for (var terminal in estado.transicoes) {
            transicao = estado.transicoes[terminal];
            if (transicao) {
              edges.push({"id": estado.id+terminal, "source": estado.id, "target": transicao, "label": terminal, "type":'curvedArrow', "size":1});
            }
          }
        }

        // We gave our own name 'border' to the custom renderer
        sigma.canvas.nodes.border = function(node, context, settings) {
          var prefix = settings('prefix') || '';

          context.fillStyle = node.color || settings('defaultNodeColor');
          context.beginPath();
          context.arc(
            node[prefix + 'x'],
            node[prefix + 'y'],
            node[prefix + 'size'],
            0,
            Math.PI * 2,
            true
          );

          context.closePath();
          context.fill();

          // Adding a border
          context.lineWidth = node.borderWidth || 1;
          context.strokeStyle = node.borderColor || '#fff';
          context.stroke();
        };

        s = new sigma({
          settings: {
            defaultEdgeColor: '#337ab7',
            defaultNodeColor: '#337ab7',
            borderSize: 4,
            defaultEdgeType: 'arrow',
            defaultNodeBorderColor: '#d9534f',
            minArrowSize: 3,
            maxEdgeSize: 3,
            maxNodeSize: 10,
            sideMargin: 0.5,
            drawEdgeLabels: true,
            defaultNodeType: 'border'
          },
          renderer: {              
            container: elemento,
            type: 'canvas'
          },
          graph: { nodes: nodes , edges: edges },
        });
    }


})