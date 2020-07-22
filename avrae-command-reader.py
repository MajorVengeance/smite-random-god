EPHEMERAL_ARG_RE = re.compile(r'([^\s]+)(\d+)')
QUOTE_PAIRS = {
    '"': '"',
    "'": "'",
    "‘": "’",
    "‚": "‛",
    "“": "”",
    "„": "‟",
    "⹂": "⹂",
    "「": "」",
    "『": "』",
    "〝": "〞",
    "﹁": "﹂",
    "﹃": "﹄",
    "＂": "＂",
    "｢": "｣",
    "«": "»",
    "‹": "›",
    "《": "》",
    "〈": "〉",
}
ALL_QUOTES = set(QUOTE_PAIRS.keys()) | set(QUOTE_PAIRS.values())

@commands.group(aliases=['a'], invoke_without_command=True)
async def attack(self, ctx, atk_name=None, *, args: str = ''):
  """Rolls an attack for the current active character.
  __Valid Arguments__
  -t "<target>" - Sets targets for the attack. You can pass as many as needed. Will target combatants if channel is in initiative.
  -t "<target>|<args>" - Sets a target, and also allows for specific args to apply to them. (e.g, -t "OR1|hit" to force the attack against OR1 to hit)
  *adv/dis* - Advantage or Disadvantage
  *ea* - Elven Accuracy double advantage

  -ac <target ac> - overrides target AC
  *-b* <to hit bonus> - adds a bonus to hit
  -criton <num> - a number to crit on if rolled on or above
  *-d* <damage bonus> - adds a bonus to damage
  *-c* <damage bonus on crit> - adds a bonus to crit damage
  -rr <times> - number of times to roll the attack against each target
  *-mi <value>* - minimum value of each die on the damage roll

  *-resist* <damage resistance>
  *-immune* <damage immunity>
  *-vuln* <damage vulnerability>
  *-neutral* <damage type> - ignores this damage type in resistance calculations
  -dtype <damage type> - replaces all damage types with this damage type
  -dtype <old>new> - replaces all of one damage type with another (e.g. `-dtype fire>cold`)

  *hit* - automatically hits
  *miss* - automatically misses
  *crit* - automatically crits if hit
  *max* - deals max damage
  *magical* - makes the damage type magical
  -h - hides name and rolled values
  -phrase <text> - adds flavour text
  -title <title> - changes the result title *note: `[name]` and `[aname]` will be replaced automatically*
  -thumb <url> - adds flavour image
  -f "Field Title|Field Text" - see `!help embed`
  <user snippet> - see `!help snippet`
  An italicized argument means the argument supports ephemeral arguments - e.g. `-d1` applies damage to the first hit, `-b1` applies a bonus to one attack, and so on.
  """
  if atk_name is None:
      return await self.attack_list(ctx)

  char: Character = await Character.from_ctx(ctx)
  args = await self.new_arg_stuff(args, ctx, char)

  caster, targets, combat = await targetutils.maybe_combat(ctx, char, args)
  attack = await search_and_select(ctx, caster.attacks, atk_name, lambda a: a.name)

  embed = EmbedWithCharacter(char, name=False)
  await attackutils.run_attack(ctx, embed, args, caster, attack, targets, combat)

  await ctx.send(embed=embed)
  await try_delete(ctx.message)

async def new_arg_stuff(args, ctx, character):
  args = await helpers.parse_snippets(args, ctx)
  args = await character.parse_cvars(args, ctx)
  args = argparse(args)
  return args


async def parse_snippets(args, ctx) -> str:
  """
  Parses user and server snippets.
  :param args: The string to parse. Will be split automatically
  :param ctx: The Context.
  :return: The string, with snippets replaced.
  """
  if isinstance(args, str):
      args = argsplit(args)
  if not isinstance(args, list):
      args = list(args)
  snippets = await get_servsnippets(ctx)
  snippets.update(await get_snippets(ctx))
  for index, arg in enumerate(args):  # parse snippets
      snippet_value = snippets.get(arg)
      if snippet_value:
          args[index] = snippet_value
      elif ' ' in arg:
          args[index] = argquote(arg)
  return " ".join(args)


async def parse_cvars(self, cstr, ctx):
  """Parses cvars.
  :param ctx: The Context the cvar is parsed in.
  :param cstr: The string to parse.
  :returns string - the parsed string."""
  evaluator = await (await ScriptingEvaluator.new(ctx)).with_character(self)

  out = await asyncio.get_event_loop().run_in_executor(None, evaluator.transformed_str, cstr)
  await evaluator.run_commits()

  return out


def argparse(args, character=None, splitter=argsplit):
  """
  Parses arguments.
  :param args: A list of arguments to parse.
  :type args: str or Iterable
  :return: The parsed arguments.
  :rtype: :class:`~utils.argparser.ParsedArguments`
  """
  if isinstance(args, str):
      args = splitter(args)
  if character:
      from cogs5e.funcs.scripting.evaluators import MathEvaluator
      evaluator = MathEvaluator.with_character(character)
      args = [evaluator.transformed_str(a) for a in args]

  parsed = collections.defaultdict(lambda: [])
  index = 0
  for a in args:
      if a.startswith('-'):
          parsed[a.lstrip('-')].append(list_get(index + 1, True, args))
      else:
          parsed[a].append(True)
      index += 1
  return ParsedArguments(parsed)

def argsplit(args: str):
    view = CustomStringView(args.strip())
    args = []
    while not view.eof:
        view.skip_ws()
        args.append(view.get_quoted_word())  # _quoted_word(view))
    return args

class CustomStringView(StringView):
    def get_quoted_word(self):
        current = self.current
        if current is None:
            return None

        close_quote = QUOTE_PAIRS.get(current)
        is_quoted = bool(close_quote)
        if is_quoted:
            result = []
            _escaped_quotes = (current, close_quote)
        else:
            result = [current]
            _escaped_quotes = ALL_QUOTES

        while not self.eof:
            current = self.get()
            if not current:
                if is_quoted:
                    # unexpected EOF
                    raise ExpectedClosingQuoteError(close_quote)
                return ''.join(result)

            # currently we accept strings in the format of "hello world"
            # to embed a quote inside the string you must escape it: "a \"world\""
            if current == '\\':
                next_char = self.get()
                if next_char in _escaped_quotes:
                    # escaped quote
                    result.append(next_char)
                else:
                    # different escape character, ignore it
                    self.undo()
                    result.append(current)
                continue

            # opening quote
            if not is_quoted and current in ALL_QUOTES and current != "'":  # special case: apostrophes in mid-string
                close_quote = QUOTE_PAIRS.get(current)
                is_quoted = True
                _escaped_quotes = (current, close_quote)
                continue

            # closing quote
            if is_quoted and current == close_quote:
                next_char = self.get()
                valid_eof = not next_char or next_char.isspace()
                if not valid_eof:  # there's still more in this argument
                    self.undo()
                    close_quote = None
                    is_quoted = False
                    _escaped_quotes = ALL_QUOTES
                    continue

                # we're quoted so it's okay
                return ''.join(result)

            if current.isspace() and not is_quoted:
                # end of word found
                return ''.join(result)

            result.append(current)

