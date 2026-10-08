# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado do repositório

Este repositório não contém o projeto GDevelop, e não é um repositório git. O projeto em construção fica em `C:\Users\Rodrigo\Documents\fogo-cruzado-project` (`Fogo Cruzado.json`, assets em `assets/`) e é a fonte do que já foi feito e do mapa. Aqui há apenas:

- [docs/GDD.md](docs/GDD.md): o Game Design Document (em português), única fonte de verdade do design.
- [.mcp.json](.mcp.json): configura o servidor MCP `codecks` (Node, em `C:/Users/Rodrigo/Documents/Projetos/Codecks-MCP`), com projeto padrão "Fogo Cruzado". Serve para gerenciar cards/decks do projeto no Codecks.

Não há comandos de build, lint ou teste. Leia o GDD antes de propor ou implementar qualquer mecânica.

## O projeto

Fogo Cruzado é um shmup vertical top-down de waves infinitas, feito em **GDevelop 5** para uma **oficina de 2 horas para iniciantes**. Isso condiciona as decisões: só comportamentos nativos, forças e variáveis, cerca de 30 eventos em uma única cena de gameplay (mais Título e Game Over). Prefira a solução mais simples de reproduzir por um aluno.

Artes: Kenney Pixel Shmup (CC0. Naves e aviões 32×32, tiles de mapa e projéteis 16×16). Os sprites escolhidos já estão em `docs/assets/` com nomes pelo papel (`jogador`, `caca`, `zigue`, `base_torre`, `torre`, `tiro_jogador`, `tiro_inimigo`, `bomba`, `mira`, `explosao_01`–`06`, `p`), mais `mapa.json` (Tiled, 14×72 tiles, versão antiga; o mapa vigente é `fogo_cruzado_map.json` no projeto GDevelop, 14×90 tiles, `AlturaMapa` = 1440, com 10 `MarcadorTanque` como instâncias na cena); recortes brutos em `docs/assets/ships/` e `tiles/`. Resolução 224×288 px, escala inteira, filtro pixel art. O pacote não tem veículos terrestres: o "Tanque" é na verdade uma **torre fixa** (base + canhão giratório), mas o projeto nomeia os objetos `BaseTorre` e `Torre`; `MarcadorTanque` mantém o nome do GDD.

## Regras de design que atravessam vários sistemas

- **Duas munições, dois alvos:** o tiro só atinge inimigos aéreos (grupo `InimigosAr`) e a bomba só atinge terrestres (`InimigosChao`). Essa separação é o núcleo do jogo.
- **Justiça:** nenhum inimigo surge em cima do jogador nem atira a menos de 48 px dele. A pausa entre waves é de no máximo 2 s. O jogador mata qualquer aéreo em no máximo 2 tiros no nível inicial. Tiros inimigos ficam em cor forte e piscando.
- **Hitbox do jogador:** 10×10 no centro do sprite de 32×32.
- **Waves geradas por fórmula, nunca desenhadas à mão:** aéreos = 4 + 2×Wave. Intervalo de spawn = max(0,4; 1,2 − 0,08×Wave). As tabelas de sorteio de tipo e de chance de tanque por wave estão no GDD.
- **Rank** (0–10): +1 por power-up, −2 por morte. Afeta só a velocidade dos tiros inimigos (140 + 5×Rank px/s) e o intervalo de tiro do tanque. A velocidade dos inimigos não muda com a wave. O teto de 12 tiros inimigos na tela é fixo.

## Arquitetura de cena (GDevelop)

- **Câmera parada, mapa rolando:** o Tilemap (224×1440, y inicial −1152) desce a 40 px/s em loop. Mapa, `MarcadorTanque` (invisíveis, posicionados à mão), `BaseTorre`, `Torre` e `Explosao` (a da bomba) ficam no grupo `RolaComChao` e descem na mesma camada e câmera, para as colisões funcionarem sem conversão. No loop, mapa e marcadores sobem `AlturaMapa − 288` e os marcadores voltam a `Usado = 0`.
- **Camadas (baixo para cima):** Chão (mapa, marcadores, tanques, explosões, mira), Ar (jogador, aéreos, power-ups), Tiros, HUD.
- **Tanques só nascem em marcadores**, com a chance da wave atual. Não contam para o fim da wave. Aéreos nascem acima da tela (Y = −16, X sorteado entre 16 e 208).
- **Fim da wave:** `ParaCriar = 0` e nenhum `InimigosAr` na cena. Se `Escapou = 0`, dá o bônus de 500×Wave.
- **Ilusão de altura via tween de escala:** a bomba vai de 1,0 a 0,5 em 0,5 s até a mira (64 px à frente da nave) e então cria a explosão (~24 px de raio). O tiro do tanque nasce com escala 0,5 e `Ativo = 0`, cresce até 1,0 em 0,3 s, e só então `Ativo = 1` (só causa dano ativo).
- **Variáveis:** Pontos, Vidas, Wave, ParaCriar, Escapou, Rank e NivelTiro ficam na cena. `Recorde` é global e salvo em armazenamento local. Nomes de objetos, grupos e variáveis do GDD (ex.: `Caca`, `Zigue`, `TiroInimigo`, `RolaComChao`) devem ser mantidos.

## Escopo

Essencial (compromisso das 2 h): nave, mapa em loop, Caça, Tanque com bomba e mira, waves por fórmula, vidas/pontos/game over. Importante: Zigue, HUD completo e recorde. Extra: power-up "P", Rank, bônus de wave perfeita e vida extra. Ao implementar, siga essa ordem de prioridade. Os alunos recebem um projeto inicial com sprites importados, camadas e a cena de título prontas.
