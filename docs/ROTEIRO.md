# Roteiro da oficina — Fogo Cruzado (2 h)

Roteiro para quem conduz a oficina. Cada bloco tem objetivo, passos que os alunos fazem, um ponto de checagem ("funciona se...") e erros comuns. O design completo está no [GDD](GDD.md); os nomes de objetos, grupos e variáveis abaixo são os do projeto GDevelop.

## Antes da oficina (preparação do instrutor)

Projeto entregue aos alunos (`fogo-cruzado-project`):

| Já vem pronto | Os alunos fazem |
| --- | --- |
| Resolução 224×288, pixel art, camadas `Ar`, `Tiros`, `HUD` | Importar `Jogador` e `Caça` (sprites em `assets/`) |
| Mapa rolando em loop, `MarcadorTanque` (10), grupo `RolaComChao` | Todos os eventos de gameplay |
| Objetos `TiroJogador`, `TiroInimigo`, `BaseTorre`, `Torre`, `Bomba`, `Mira`, `Explosao`, `ExplosaoAr`, `PowerUp`, `Zigue` | |
| Variáveis de cena (`Pontos`, `Vidas`, `Wave`, `ParaCriar`, `Escapou`, `Rank`, `NivelTiro`) e global `Recorde` | |

Checklist:

- [x] Cena **Título** pronta ("Aperte Z para começar" leva à cena `Jogo`).
- [x] Cena **Game Over** criada (pode estar vazia; o aluno só liga a transição).
- [x] Textos do HUD já colocados na camada `HUD`: `PontosLabel` (canto superior esquerdo), `RecordeLabel` (centro) e `WaveLabel` (canto superior direito), em duas linhas (`PTS` / `000000`, `REC` / `000000`, `WAV` / `000000`) para caber pontuações de até 6 dígitos.
- [x] Vidas no HUD: texto `VidaLabel` (`♥ x 3`) no canto inferior esquerdo da camada `HUD`, em vez de ícones de sprite.
- [x] `SkyBackground` abaixo de tanques e explosões (fundo com Z-order 3; tanques e explosões criados por evento recebem Z-order 10 ou mais, conforme o Bloco 4).
- [ ] `TiroInimigo` com variável `Ativo` e máscara redonda de ~8×8 (hoje é 6×16).
- [x] `Explosao` com escala de ~3× (sprites reescalados para 48×48, raio de ~24 px, máscara de colisão 48×48).
- [ ] Um arquivo de **checkpoint por bloco** (projeto salvo ao fim de cada bloco) para quem ficar para trás.
- [ ] Teste completo com uma pessoa de fora, cronometrando até a nave atirar (meta: 30 min).

## Visão geral do tempo

| Minutos | Bloco | Prioridade |
| --- | --- | --- |
| 0–10 | Abertura e tour do projeto | – |
| 10–25 | 1. Nave | Essencial |
| 25–40 | 2. Tiro | Essencial |
| 40–60 | 3. Caça, spawn e abate | Essencial |
| 60–85 | 4. Bomba, mira e tanque | Essencial |
| 85–100 | 5. Waves | Essencial |
| 100–115 | 6. Vidas, morte e game over | Essencial |
| 115–120 | Fechamento | – |
| Se sobrar tempo | 7. Zigue, tiro do tanque, HUD e recorde | Importante |
| Extras (casa) | Power-up "P", Rank, wave perfeita, vida extra | Extra |

Os dois blocos de maior risco de atraso são o 4 (bomba) e o 6. Se o tempo apertar, o tanque não precisa atirar e o Zigue pode virar tarefa para casa.

## Abertura e tour (0–10 min)

1. Mostrar o jogo pronto rodando por 1 minuto.
2. Apresentar a regra central: **duas munições, dois alvos**. O tiro só acerta aéreos (`InimigosAr`) e a bomba só acerta terrestres (`InimigosChao`).
3. Tour pelo projeto: cena `Jogo`, camadas, lista de objetos, grupos, variáveis de cena. Mostrar que o mapa já rola (eventos 1 a 3).
4. Combinar o ritmo: a cada bloco, demonstrar no projetor, os alunos fazem, checagem em conjunto.

## Bloco 1 — Nave (10–25 min)

**Objetivo:** o `Jogador` aparece e se move.

1. Criar objeto Sprite `Jogador` importando `jogador.png`. Ponto de origem no centro.
2. Máscara de colisão personalizada de **10×10** no centro do sprite de 32×32 (a regra de justiça do jogo).
3. Comportamento **Movimento top-down**: velocidade máxima 120, aceleração e desaceleração altas (resposta imediata, sem deslizar).
4. Colocar o `Jogador` na camada `Ar`, no centro inferior (x = 112, y = 240).
5. Evento para manter a nave na tela: `Jogador.X = clamp(Jogador.X(), 16, 208)` e `Jogador.Y = clamp(Jogador.Y(), 16, 272)`.

**Funciona se:** a nave se move em 8 direções com as setas e não sai da tela.

**Erros comuns:** esquecer a origem no centro (a nave sai 16 px da tela); máscara de colisão no tamanho do sprite inteiro; nave criada na camada base e escondida atrás do `SkyBackground`.

## Bloco 2 — Tiro (25–40 min)

**Objetivo:** atirar com Z ou J, com cadência de 0,15 s.

1. Evento: tecla Z **ou** J pressionada, e timer de cena `tiro` > 0,15 → criar `TiroJogador` na posição do `Jogador`, camada `Tiros`; reiniciar o timer `tiro`.
2. No `TiroJogador`: força permanente (0, −300) ao criar, e comportamento **Destruir fora da tela**.

**Funciona se:** segurar Z solta um fluxo contínuo de tiros que saem pelo topo e somem.

**Erros comuns:** esquecer de reiniciar o timer (um tiro por frame, centenas de tiros); esquecer o Destruir fora da tela (a cena acumula tiros).

## Bloco 3 — Caça, spawn e abate (40–60 min)

**Objetivo:** inimigos aéreos surgem sozinhos e morrem com 1 tiro.

1. Criar o objeto `Caca` importando `caca.png`. Variável de objeto `Vida = 1`. Máscara 32×24 no centro. Comportamento Destruir fora da tela.
2. Colocar `Caca` no grupo `InimigosAr` (o grupo já existe, com o `Zigue`).
3. Evento de spawn: `ParaCriar > 0` e timer `spawn` > intervalo → criar `Caca` em x = `Random(16, 208)`, y = −16, camada `Ar`; `ParaCriar − 1`; reiniciar timer `spawn`. Para testar, definir `ParaCriar = 10` e intervalo 1 s.
4. Movimento: força permanente (0, 90) ao criar.
5. Colisão `TiroJogador` × `InimigosAr`: `Vida − 1`, destruir o tiro. 
6. Evento seguinte: `Vida <= 0` → Para cada InimigosAr criar `ExplosaoAr` na posição do inimigo (camada `Ar`; é só visual e não machuca ninguém, por isso não se usa a `Explosao`, que destrói tanques), `Pontos + 100`, destruir o inimigo.

**Funciona se:** os caças descem, um tiro mata e o `Pontos` sobe 100 (ver na barra de depuração).

**Erros comuns:** `Vida` em maiúscula/minúscula diferente; apagar o inimigo na mesma colisão antes de somar os pontos; `ExplosaoAr` em loop (a animação nunca termina); usar `Explosao` em vez de `ExplosaoAr` (o tanque embaixo morre junto).

## Bloco 4 — Bomba, mira e tanque (60–85 min)

**Objetivo:** a segunda munição. É o bloco mais denso; usar o checkpoint se necessário.

1. **Mira:** a cada frame, `Mira` na posição (`Jogador.X`, `Jogador.Y − 64`), camada base.
2. **Bomba:** tecla X ou K pressionada e `SceneInstancesCount(Bomba) = 0` → criar `Bomba` na nave, camada `Tiros`. Tween de escala de 1,0 a 0,5 em 0,5 s, e tween de posição até a `Mira` em 0,5 s.
3. **Explosão da bomba:** ao terminar o tween, criar `Explosao` na posição da bomba (camada base), ação **Mudar o Z-order** da `Explosao` para `10` (acima do `SkyBackground`, que tem Z-order 3), e destruir a `Bomba`. A `Explosao` fica no grupo `RolaComChao` para descer junto com o mapa e os tanques; a `Bomba` **não** entra no grupo (ela está no ar e já se move por tween). Opcional, para a bomba cair exatamente no ponto do chão que estava sob a mira: destino do tween em `Mira.Y() + 20` (o chão desce 40 px/s × 0,5 s).
4. **Tanque:** evento com `MarcadorTanque.Y > −16` e `Usado = 0` → `Usado = 1`; se `Random(1, 100)` ≤ chance da wave, criar `BaseTorre` e `Torre` na posição do marcador e mudar o Z-order da `BaseTorre` para `10` e o da `Torre` para `11` (a torre fica sobre a base, ambas acima do `SkyBackground`). Nesta versão da oficina, chance simples: 0% na wave 1, 45% da wave 2 em diante (a tabela completa é Importante).
5. **Torre:** a `Torre` desce junto com a `BaseTorre`. O jeito mais simples é as duas ficarem no grupo `RolaComChao`; assim a torre não precisa ser reposicionada. O sprite da `Torre` precisa estar apontando para a direita (ângulo 0). Depois use a ação "Rotacionar na direção de um objeto" com o `Jogador`, a cada frame.
6. **Dano:** colisão `Explosao` × `Torre`: `Pontos + 300` e destruir a `Torre`; colisão `Explosao` × `BaseTorre`: só destruir. Assim os 300 pontos são somados uma vez só, e o tanque não vale 600. Só a `Explosao` da bomba destrói tanques; as explosões do ar usam `ExplosaoAr`.

**Funciona se:** a mira acompanha a nave, a bomba cai na mira, o tanque que estiver dentro da explosão morre e dá 300 pontos, e o tiro comum não afeta tanques.

**Erros comuns:** esquecer `SceneInstancesCount(Bomba) = 0` (várias bombas); tween de escala sem tween de posição (a bomba não se move); `Explosao` sem a escala e raio de só 8 px; `Usado` nunca marcado (o tanque nasce em todo frame); esquecer o Z-order (objetos criados por evento nascem com Z-order 0 e ficam escondidos atrás do `SkyBackground`).

## Bloco 5 — Waves (85–100 min)

**Objetivo:** o jogo vira infinito, mais difícil a cada wave.

1. No início da cena: `Wave = 1`, `ParaCriar = 4 + 2 × Wave`, `Escapou = 0`.
2. Intervalo do spawn: `max(0.4, 1.2 − 0.08 × Wave)`.
3. Fim da wave: `ParaCriar = 0` e `SceneInstancesCount(InimigosAr) = 0` → se `Escapou = 0`, `Pontos + 500 × Wave`; `Wave + 1`; `ParaCriar = 4 + 2 × Wave`; `Escapou = 0`; **reiniciar o cronômetro `spawn`**. Essa última ação é a pausa entre waves: sem ela, o timer já passou do intervalo e o primeiro inimigo da wave nova nasce no mesmo frame.
4. Contar fuga: inimigo aéreo com `Y > 288` → `Escapou + 1`, destruir. Isso só é confiável porque o "Destruir fora da tela" de `Caca` e `Zigue` está com margem de 200 px (já configurada no projeto): o evento sempre dispara antes do comportamento apagar o objeto. Com a margem padrão (15 px), um frame de lag poderia apagar o aéreo sem contar a fuga, e o bônus de wave perfeita sairia indevido.

**Funciona se:** ao zerar os aéreos, a wave sobe e vêm mais inimigos, com a pausa curta (no máximo 2 s). Ninguém surge em cima da nave.

**Erros comuns:** testar o fim da wave sem `ParaCriar = 0` (a wave termina no primeiro frame); esquecer de zerar `Escapou`; esquecer de reiniciar o `spawn` no fim da wave (sem pausa entre waves).

## Bloco 6 — Vidas, morte e game over (100–115 min)

**Objetivo:** fechar o loop do jogo.

1. No início: `Vidas = 3`, `Pontos = 0`.
2. Colisão `Jogador` × `InimigosAr`, sem invulnerabilidade → `Vidas − 1`, criar `ExplosaoAr` na posição do `Jogador` (camada `Ar`), reposicionar a nave no centro inferior. (Os tiros inimigos só entram na morte no Bloco 7.)
3. Invulnerabilidade de 2 s com o comportamento **Piscar** (a colisão só vale se o jogador **não** estiver piscando).
4. `Vidas <= 0` → ir para a cena `Game Over`. Na cena `Game Over`, Z volta ao Título.

**Funciona se:** bater num caça tira uma vida, a nave volta piscando e, ao zerar as vidas, aparece o Game Over.

**Erros comuns:** testar a colisão com a nave invulnerável (perde 3 vidas em 3 frames); esquecer de mudar de cena.

## Fechamento (115–120 min)

- Cada aluno joga a própria versão por 2 minutos e anota um recorde.
- Mostrar o que ficou de fora e como seguir: Zigue, tiro do tanque, HUD, power-up, Rank.

## Bloco 7 — Se sobrar tempo (Importante)

- **Zigue:** o objeto já existe no projeto. `Vida = 2`, movimento `X = X0 + sin(TimeFromStart() × 3) × 32` e `Y + 60 × TimeDelta()`. Sorteio de tipo por wave (tabela do GDD).
- **Tiro mirado:** criar `TiroInimigo` na posição do inimigo, força na direção do `Jogador`, velocidade `140 + 5 × Rank`, só se a distância for maior que 48 px e `SceneInstancesCount(TiroInimigo) < 12`. Tiro do tanque: escala 0,5, `Ativo = 0`, tween até 1,0 em 0,3 s, depois `Ativo = 1`. Tiros dos aéreos nascem com `Ativo = 1`. Depois, voltar ao evento de morte do Bloco 6: acrescentar `TiroInimigo` com `Ativo = 1` à condição da colisão com o `Jogador` (junto com `InimigosAr`) e, na ação, apagar todos os `TiroInimigo`.
- **HUD:** ligar os textos às variáveis a cada frame, mantendo a quebra de linha e os 6 dígitos. Exemplo: `PontosLabel` → mudar o texto para `"PTS" + NewLine() + ToString(Pontos)`; o mesmo para `"REC" + NewLine() + ToString(Recorde)` e `"WAV" + NewLine() + ToString(Wave)`. Os números aparecem sem zeros à esquerda (`120`); completar com zeros fica fora do escopo da oficina. Vidas: `VidaLabel` → mudar o texto para `"♥ x " + ToString(Vidas)`.
- **Pausa fixa e "WAVE N":** troca a pausa do Bloco 5 (1 intervalo de spawn) por uma de 1,5 s, com o número da wave na tela. No fim da wave, além das ações do Bloco 5, **reiniciar o cronômetro de cena `onda`**. No evento de spawn, acrescentar a condição `onda > 1.5`. Criar um texto `WaveAviso` na camada `HUD`, no centro da tela, e a cada frame: se `onda < 1.5`, mudar o texto para `"WAVE " + ToString(Wave)` e mostrá-lo; senão, escondê-lo. No início da cena, reiniciar `onda` também, para a wave 1 ter o aviso. A pausa de 1,5 s fica abaixo do limite de 2 s do GDD.
- **Recorde:** ler e escrever `Recorde` no armazenamento local; mostrar "NOVO RECORDE" no Game Over.

## Extras (para casa)

Power-up "P" (20% de chance ao abater um Zigue, sobe o `NivelTiro`), Rank (+1 por "P", −2 por morte), bônus de wave perfeita e vida extra a cada 10.000 pontos.

## Regras de justiça (conferir em cada bloco)

- Nenhum inimigo surge em cima do jogador nem atira a menos de 48 px dele.
- O jogador mata qualquer aéreo em no máximo 2 tiros.
- Tiros inimigos em cor forte e piscando; fundo apagado.
- No máximo 12 tiros inimigos na tela (`SceneInstancesCount(TiroInimigo) < 12`).
