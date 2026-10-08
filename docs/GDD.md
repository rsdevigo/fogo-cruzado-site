# GDD — Fogo Cruzado (Oficina GDevelop)

Sep 29, 2026 · @Rodrigo

## Visão geral

Fogo Cruzado é um shmup vertical top-down de waves infinitas: o jogador pilota um avião que abate inimigos aéreos com tiros e destrói unidades terrestres com bombas, até perder as 3 vidas. O objetivo é bater o recorde de pontos.

| Item | Definição |
| --- | --- |
| Gênero | Shmup vertical, estilo oldschool (poucos tiros inimigos, rápidos e mirados) |
| Modo | Arcade infinito, 1 jogador, partidas de 3 a 10 minutos |
| Engine | GDevelop 5 |
| Arte | [Kenney Pixel Shmup](https://kenney.nl/assets/pixel-shmup): naves e aviões de 32×32, tiles de mapa e projéteis de 16×16, licença CC0 |
| Resolução | 224×288 px (proporção de arcade vertical), escala por inteiro, filtro pixel art |
| Contexto | Oficina de 2 horas para iniciantes em GDevelop |

Referências de gameplay: Xevious (tiro no ar + bomba no chão com mira), 1942 e Raiden (tiros inimigos mirados e rápidos).

## Pilares e convenções do gênero

O jogo segue as convenções clássicas de shmup e quatro regras de design que valem para todo sistema, principalmente para o spawn automático.

| Convenção | Como aparece no jogo |
| --- | --- |
| Projéteis | Tiro contínuo contra o ar; bomba com mira contra o chão |
| Movimento 2D | 8 direções, tela inteira disponível, arma sempre para cima |
| Rolagem automática | O chão desce sozinho em velocidade constante |
| Morte com 1 acerto | Qualquer tiro ou colisão tira 1 vida |
| Pontuação | Pontos por abate, bônus de wave e recorde salvo |
| Power-ups | Item "P" aumenta o tiro em até 3 níveis |
| Hitbox | Menor que o sprite (10×10 no centro da nave de 32×32) |
| Rank | Dificuldade sobe com a wave e com o poder do jogador, alivia quando ele morre |

Regras de design:

1. **Perfeição teórica:** nenhum dano pode ser inevitável. Inimigos nunca surgem em cima do jogador e não atiram a menos de 48 px dele.
2. **Pouco tempo morto:** a pausa entre waves dura no máximo 2 segundos.
3. **Poder de fogo suficiente:** o jogador mata qualquer inimigo aéreo em no máximo 2 tiros no nível inicial.
4. **Visibilidade:** tiros inimigos em cor forte e piscando; fundo com cores mais apagadas.

## Jogador

A nave do jogador se move em 8 direções a 120 px/s, presa aos limites da tela, e começa com 3 vidas.

| Ação | Teclado | Observação |
| --- | --- | --- |
| Mover | Setas ou WASD | Sem aceleração, resposta imediata |
| Atirar | Z ou J (segurar) | Disparo automático enquanto segura |
| Bombardear | X ou K | Uma bomba por vez na tela |

- **Hitbox:** máscara de colisão de 10×10 px no centro do sprite de 32×32. Asas e cauda não recebem dano.
- **Morte:** explosão, perde 1 vida e 1 nível de tiro. Todos os tiros inimigos na tela são apagados.
- **Renascimento:** a nave volta no centro inferior com 2 segundos de invulnerabilidade, piscando.
- **Game over:** ao chegar a 0 vidas, vai para a tela de game over.

## Armas

Cada munição acerta só um tipo de alvo: o tiro atinge apenas inimigos aéreos e a bomba atinge apenas unidades terrestres. Essa separação é o centro da decisão do jogador.

| Munição | Alvo | Comportamento | Cadência | Dano |
| --- | --- | --- | --- | --- |
| Tiro | Aéreo | Sobe em linha reta a 300 px/s | 1 a cada 0,15 s | 1 |
| Bomba | Terrestre | Sobe até a mira e explode após 0,5 s | 1 na tela por vez | Mata qualquer terrestre na área |

**Mira da bomba:** um retículo fica sempre 64 px à frente da nave, mostrando onde a bomba vai cair. A explosão tem cerca de 24 px de raio.

**Queda da bomba:** a bomba sai do avião com escala 1,0 e diminui até 0,5 durante os 0,5 s de viagem até a mira, simulando a queda. Ao chegar, cria a explosão, que só atinge unidades terrestres. Opcional: uma sombra pequena e escura acompanha a bomba pelo chão.

**Níveis de tiro (power-up "P"):**

1. Tiro simples, no centro.
2. Tiro duplo, paralelo.
3. Tiro triplo, com os laterais abertos em 10°.

## Inimigos

São 3 tipos, cada um com um comportamento próprio e simples de reproduzir: 2 aéreos e 1 terrestre. Os aéreos nascem acima da tela por sorteio; o Tanque surge apenas nos pontos marcados no mapa. Todos são destruídos ao sair por baixo.

| Inimigo | Camada | Movimento | Ataque | Vida | Pontos | Libera na wave |
| --- | --- | --- | --- | --- | --- | --- |
| Caça | Ar | Desce reto a 90 px/s | Nenhum | 1 | 100 | 1 |
| Tanque | Chão | Parado no mapa; desce junto com ele (40 px/s) | Gira a torre para o jogador e dispara 1 tiro mirado a cada 2 s | 1 bomba | 300 | 2 (nos marcadores) |
| Zigue | Ar | Desce a 60 px/s oscilando 32 px para os lados | 1 tiro mirado ao passar por 1/3 da tela | 2 | 200 | 3 |

**Tiros inimigos (estilo oldschool):** poucos, rápidos (140 px/s) e sempre mirados na posição do jogador no momento do disparo. Máximo de 12 na tela ao mesmo tempo.

**Tiro do tanque:** nasce na ponta do canhão com escala 0,5 e cresce até 1,0 em 0,3 s, simulando a subida até a altura do avião. Só causa dano ao chegar à escala 1,0, o que dá ao jogador um instante para reagir.

**Regras de justiça:**

- Nenhum inimigo atira se estiver a menos de 48 px do jogador.
- O tanque só atira depois de estar inteiro na tela.
- Colidir com um inimigo aéreo mata o jogador; passar por cima de um tanque não.

## Sistema de waves e rank

As waves são geradas automaticamente e não têm fim: cada wave tem mais inimigos, surge mais rápido e libera tipos novos. Nenhuma wave é desenhada à mão.

**Ciclo de uma wave:**

1. Mostra "WAVE N" no centro da tela por 1,5 s.
2. Define quantos inimigos aéreos a wave terá e zera o contador de spawn.
3. A cada intervalo, sorteia um tipo aéreo e uma posição X e cria o inimigo acima da tela.
4. Em paralelo, cada marcador de tanque que entra na tela sorteia se cria um Tanque, com a chance da wave atual.
5. Quando todos os aéreos já surgiram e nenhum resta na cena, a wave termina. Tanques não contam para o fim da wave.
6. Se nenhum inimigo aéreo escapou pela parte de baixo, concede o bônus de wave perfeita.
7. Soma 1 à wave e volta ao passo 1.

**Fórmulas:**

- Inimigos aéreos na wave = 4 + 2 × Wave
- Intervalo de spawn (s) = máximo entre 0,4 e 1,2 − 0,08 × Wave
- Posição X = sorteio entre 16 e 208 px (origem no centro do sprite de 32×32, então a margem de 16 px mantém a nave inteira na tela)

**Sorteio do tipo aéreo e chance de tanque por marcador:**

| Waves | Caça | Zigue | Chance de tanque por marcador |
| --- | --- | --- | --- |
| 1 | 100% | – | 0% |
| 2 | 100% | – | 30% |
| 3 a 5 | 60% | 40% | 45% |
| 6 a 9 | 50% | 50% | 60% |
| 10 em diante | 50% | 50% | 70% |

**Rank (dificuldade dinâmica):** uma variável invisível que sobe 1 a cada power-up pego e desce 2 a cada morte, com mínimo 0 e máximo 10. Cada ponto de rank aumenta a velocidade dos tiros inimigos em 5 px/s e reduz o intervalo de tiro do tanque em 0,1 s (mínimo de 1 s).

No teto de 10, os tiros inimigos chegam a 190 px/s e o Tanque atinge o intervalo mínimo de 1 s. O limite de 12 tiros inimigos na tela é uma trava de segurança fixa, e a velocidade dos inimigos não muda com a wave.

## Pontuação e power-ups

A pontuação é o objetivo principal: pontos por abate, bônus por wave perfeita e uma vida extra a cada 10.000 pontos.

| Evento | Pontos |
| --- | --- |
| Caça abatido | 100 |
| Zigue abatido | 200 |
| Tanque destruído | 300 |
| Wave perfeita (nenhum inimigo escapou) | 500 × número da wave |
| Pegar "P" com o tiro já no nível 3 | 1.000 |

- **Vida extra:** a cada 10.000 pontos, máximo de 5 vidas.
- **Recorde:** salvo no armazenamento local e mostrado no HUD e no game over.
- **Power-up "P":** cada Zigue abatido tem 20% de chance de soltar um "P", que desce devagar (30 px/s) e sobe o tiro 1 nível.

## Cenário, câmera e camadas

A câmera fica parada; quem se move é o mapa, um Tilemap pronto que rola para baixo a 40 px/s em loop infinito. Tanques e marcadores descem junto, então parecem presos ao chão.

- **Mapa:** Tilemap de 224×1440 px (5 telas) montado com os tiles do pacote. As primeiras e as últimas linhas são iguais, para o loop não mostrar emenda.
- **Marcadores de tanque:** objetos invisíveis posicionados à mão sobre estradas, bases e clareiras. Definem onde um Tanque pode surgir.
- **Rolagem:** Mapa, marcadores, tanques (`BaseTorre` e `Torre`) e a `Explosao` da bomba (que fica presa ao chão enquanto dura) ficam no grupo RolaComChao e descem 40 × TimeDelta() por frame, na mesma camada e câmera, para as colisões funcionarem sem conversão. A `Torre` fica no grupo para descer com a base sem precisar de um evento que ligue cada torre à sua base, o que é mais difícil para iniciantes.
- **Loop:** quando o topo do mapa chega ao topo da tela, mapa e marcadores sobem pela mesma distância e os marcadores voltam a ficar disponíveis.
- **Preparo:** mapa e marcadores entregues prontos; os alunos só adicionam ou movem alguns marcadores.

| Camada (de baixo para cima) | Conteúdo |
| --- | --- |
| Chão | Mapa, marcadores (invisíveis), tanques, explosões de bomba, mira da bomba |
| Ar | Jogador, inimigos aéreos, power-ups |
| Tiros | Tiros do jogador e dos inimigos |
| HUD | Textos e ícones, sem mover com a câmera |

## HUD e telas

O jogo tem 3 cenas e um HUD mínimo, com fonte bitmap ou pixel.

**HUD:** pontuação no canto superior esquerdo, recorde no centro superior, wave atual no canto superior direito e ícones de vida no canto inferior esquerdo.

| Cena | Conteúdo | Sai para |
| --- | --- | --- |
| Título | Nome do jogo, recorde, "Aperte Z para começar" | Jogo |
| Jogo | Gameplay e HUD | Game Over |
| Game Over | Pontuação final, recorde (com aviso de "NOVO RECORDE"), wave alcançada | Título, ao apertar Z |

## Mapeamento de assets

Todos os sprites vêm do [Kenney Pixel Shmup](https://kenney.nl/assets/pixel-shmup) (CC0). Naves e aviões são de 32×32 e tiles de mapa e projéteis, de 16×16. Os recortes estão em `docs/assets/`: `ship_00` a `ship_23` (32×32, de `ships_packed.png`) e `tile_0000` a `tile_0119` (16×16, de `tiles_packed.png`). Os arquivos escolhidos já estão em `docs/assets/`, com nomes pelo papel no jogo. Os recortes originais ficam em `ships/` e `tiles/`.

| Objeto do jogo | O que procurar no pacote | Arquivo escolhido |
| --- | --- | --- |
| Jogador | Avião de cor clara, apontando para cima | `jogador.png` (32×32) |
| Caça | Avião pequeno de outra cor, girado 180° | `caca.png` (32×32) |
| Zigue | Avião de formato diferente do Caça, girado 180° | `zigue.png` (32×32) |
| Tanque (base e torre) | Torre fixa: base e canhão giratório separados | `base_torre.png` (base) e `torre.png` (canhão), 16×16 |
| Tiro do jogador | Projétil alongado | `tiro_jogador.png` (16×16) |
| Tiro inimigo | Projétil redondo, recolorido em vermelho ou amarelo | `tiro_inimigo.png` (16×16) |
| Bomba e mira | Projétil maior; mira desenhada à mão se não existir | `bomba.png` e `mira.png` (16×16) |
| Explosão | Sequência de quadros de explosão | `explosao_01.png` a `explosao_06.png` (16×16) |
| Power-up "P" | Ícone de item | `p.png` (16×16) |
| Mapa e marcadores | Tiles de chão, água, árvores e estradas para montar o Tilemap | `mapa.json` (Tiled, 14×90 tiles de 16×16 = 224×1440 px; no projeto GDevelop é `fogo_cruzado_map.json`, e os 10 `MarcadorTanque` são instâncias na cena) e tiles de `tiles/` |

O pacote não tem veículos terrestres, então o "Tanque" é uma **torre fixa** (base e canhão que gira). Por isso ele fica parado no chão e só desce com o mapa. O conceito segue chamado "Tanque": `MarcadorTanque` e as variáveis mantêm esse nome, e os objetos são `BaseTorre` (base) e `Torre` (canhão), como no projeto.

## Implementação no GDevelop

O jogo cabe em uma cena de gameplay com cerca de 30 eventos, usando apenas comportamentos nativos, forças e variáveis.

**Objetos e comportamentos:**

| Objeto | Grupo | Comportamentos | Variáveis de objeto |
| --- | --- | --- | --- |
| Jogador | – | Movimento top-down (sem aceleração), Piscar | – |
| Caca | InimigosAr | Destruir fora da tela | Vida = 1 |
| Zigue | InimigosAr | Destruir fora da tela | Vida = 2, X0, Atirou |
| BaseTorre, Torre | InimigosChao, RolaComChao (os dois) | Destruir fora da tela | Vida = 1 |
| Mapa | RolaComChao | Tilemap | – |
| MarcadorTanque | RolaComChao | Oculto no início | Usado = 0 |
| TiroJogador | – | Destruir fora da tela | – |
| TiroInimigo | – | Destruir fora da tela | – |
| Explosao | RolaComChao | – | – |
| Bomba, Mira, ExplosaoAr | – | – | – |
| PowerUp | – | Destruir fora da tela | – |

**Variáveis:**

| Variável | Escopo | Uso |
| --- | --- | --- |
| Pontos, Vidas, Wave | Cena | Estado da partida |
| ParaCriar, Escapou | Cena | Controle da wave atual |
| Rank, NivelTiro | Cena | Dificuldade dinâmica e power-up |
| Recorde | Global | Carregado e salvo no armazenamento |
| spawn, tiro, tanque | Timers de cena/objeto | Intervalos de spawn e disparo (ver tabela abaixo) |

**Timers:**

| Timer | Escopo | Intervalo | Uso |
| --- | --- | --- | --- |
| `spawn` | Cena | máximo entre 0,4 e 1,2 − 0,08 × Wave (s) | Cria um aéreo quando `ParaCriar > 0`, e reinicia |
| `tiro` | Cena | 0,15 s | Cadência do tiro do jogador enquanto Z ou J está pressionado |
| `tanque` | Objeto (cada `Torre`) | máximo entre 1 e 2 − 0,1 × Rank (s) | Disparo mirado do tanque, só com o tanque inteiro na tela e a mais de 48 px do jogador |

O timer `tanque` é de **objeto** para cada torre ter o seu; num timer de cena todas atirariam juntas.

Tempos sem timer nomeado:

- **Invulnerabilidade de 2 s** ao renascer: comportamento Piscar com duração de 2 s (ou, alternativamente, um timer de cena `invul`).
- **"WAVE N" por 1,5 s** no início de cada wave: timer de cena (por exemplo `onda`), exercício extra.
- **Tweens e animações** (bomba 0,5 s, tiro do tanque 0,3 s, explosão 6 × 0,06 s = 0,36 s) usam a duração do próprio tween ou da animação.
- **Zigue** oscila com `TimeFromStart()` (relógio da cena) e atira uma vez, controlado pela variável `Atirou`.

**Eventos-chave (em pseudocódigo):**

```text
ROLAGEM E LOOP DO MAPA
  RolaComChao: Y + 40 * TimeDelta()
  Se Mapa.Y() >= 0:
    Mapa.Y - (AlturaMapa - 288)
    MarcadorTanque.Y - (AlturaMapa - 288), Usado = 0

SPAWN AÉREO
  Se ParaCriar > 0 e timer "spawn" > intervalo:
    Sorteio = RandomInRange(1, 100)
    Cria Caca ou Zigue conforme a tabela de chances
    X = RandomInRange(16, 208), Y = -16
    ParaCriar - 1, reinicia "spawn"

SPAWN DO TANQUE
  Se MarcadorTanque.Y() > -16 e Usado = 0:
    Usado = 1
    Se RandomInRange(1, 100) <= ChanceTanque (tabela da wave):
      Cria BaseTorre na posição do marcador

FIM DA WAVE
  Se ParaCriar = 0 e número de InimigosAr = 0:
    Se Escapou = 0: Pontos + 500 * Wave
    Wave + 1, ParaCriar = 4 + 2 * Wave, Escapou = 0
    Reinicia "spawn" (pausa entre waves = 1 intervalo de spawn)

MOVIMENTOS
  Caca: força permanente (0, 90)
  Zigue: Y + 60 * TimeDelta(); X = X0 + sin(TimeFromStart() * 3) * 32
  BaseTorre e Torre: descem juntas com RolaComChao (a torre nasce sobre a base, sem reposicionar); a torre gira para o Jogador

TIRO MIRADO
  Cria TiroInimigo na posição do inimigo
  Força permanente em direção ao Jogador, velocidade 140 + 5 * Rank
  (só se Distance(inimigo, Jogador) > 48 e houver menos de 12 tiros)
  Tiro do Tanque: escala 0,5, Ativo = 0; tween de escala até 1 em 300 ms; ao terminar, Ativo = 1
  Tiros dos aéreos: nascem com Ativo = 1

BOMBA
  Cria Bomba na nave; move até a Mira em 0,5 s com tween de escala de 1 até 0,5
  Ao terminar o tween: cria Explosao na posição e apaga a Bomba

COLISÕES
  TiroJogador x InimigosAr: Vida - 1, apaga o tiro; Vida <= 0 → explode e soma pontos
  Explosao x InimigosChao: destrói e soma pontos
  Jogador x (TiroInimigo com Ativo = 1 ou InimigosAr), sem invulnerabilidade: morte
```

## Escopo da oficina

O núcleo jogável (voar, atirar, bombardear, waves e game over) é o compromisso das 2 horas. O resto fica como extra para quem terminar antes ou para continuar em casa.

| Recurso | Prioridade | Observação |
| --- | --- | --- |
| Nave, movimento e tiro | Essencial | Base de tudo |
| Mapa rolando em loop | Essencial | Mapa e marcadores entregues prontos |
| Caça e spawn por timer | Essencial | Primeiro inimigo |
| Tanque, bomba e mira | Essencial | Segunda munição |
| Ciclo de waves e fórmulas | Essencial | Torna o jogo infinito |
| Vidas, pontos e game over | Essencial | Fecha o loop |
| Zigue com tiro mirado | Importante | Terceiro comportamento |
| HUD completo e recorde salvo | Importante | Armazenamento local |
| Power-up "P" e níveis de tiro | Extra |  |
| Rank | Extra | Pode ser explicado sem implementar |
| Bônus de wave perfeita e vida extra | Extra |  |

Para ganhar tempo, entregar aos alunos um projeto inicial com os sprites já importados, as camadas criadas e a cena de título pronta.
